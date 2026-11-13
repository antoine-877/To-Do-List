import { readFile } from "node:fs/promises";
import { inspect } from "node:util";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const colors = {
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
  dim: "\u001b[2m",
  reset: "\u001b[0m",
};

function colorize(value, color, enabled) {
  return enabled ? `${colors[color]}${value}${colors.reset}` : value;
}

function terminalColorsEnabled() {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) {
    return process.env.FORCE_COLOR !== "0";
  }

  return (
    process.stdout.isTTY &&
    process.env.TERM !== "dumb" &&
    process.env.NODE_DISABLE_COLORS === undefined
  );
}

function eventFile(data) {
  if (typeof data.file !== "string" || !data.file) return null;

  if (data.file.startsWith("file:///")) {
    try {
      return resolve(fileURLToPath(data.file));
    } catch {
      return null;
    }
  }

  return resolve(data.file);
}

function eventKey(data) {
  return `${data.file ?? ""}\u0000${data.nesting}\u0000${data.name}`;
}

function displayPath(file, cwd) {
  return file ? relative(cwd, file).split(sep).join("/") : "fichier inconnu";
}

function errorChain(error) {
  const chain = [];
  const seen = new Set();
  let current = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = current.cause;
  }

  return chain;
}

function stackFrames(error) {
  return errorChain(error).flatMap((item) => {
    if (typeof item.stack !== "string") return [];

    return item.stack.split(/\r?\n/).flatMap((line) => {
      const match = line.match(
        /(?:\(|^)(?<file>(?:file:\/\/\/|[A-Za-z]:[\\/]|\/)[^()\r\n]+):(?<line>\d+):(?<column>\d+)\)?$/,
      );
      if (!match?.groups) return [];

      let file = match.groups.file;
      if (file.startsWith("file:///")) {
        try {
          file = fileURLToPath(file);
        } catch {
          return [];
        }
      }

      return [
        {
          file: resolve(file),
          line: Number(match.groups.line),
          column: Number(match.groups.column),
        },
      ];
    });
  });
}

function samePath(left, right) {
  const normalizedLeft = resolve(left);
  const normalizedRight = resolve(right);
  return process.platform === "win32"
    ? normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
    : normalizedLeft === normalizedRight;
}

function failureLocation(error, testFile) {
  const frames = stackFrames(error);
  if (testFile) {
    const testFrame = frames.find((frame) => samePath(frame.file, testFile));
    if (testFrame) return testFrame;
  }

  return frames.find((frame) => frame.file.includes(`${sep}test${sep}`)) ?? null;
}

function describeFailure(error) {
  const cause = errorChain(error).at(-1) ?? error;
  const name = cause?.name ?? cause?.code ?? "Erreur";
  const message = cause?.message ?? "Le runner n’a fourni aucun message.";

  if (cause?.name === "AssertionError" || cause?.code === "ERR_ASSERTION") {
    const explanation = ["L’assertion du test n’a pas été satisfaite."];

    if ("expected" in cause && "actual" in cause) {
      explanation.push(
        `Valeur attendue : ${inspect(cause.expected, { depth: 2, colors: false, maxArrayLength: 10 })}`,
        `Valeur obtenue : ${inspect(cause.actual, { depth: 2, colors: false, maxArrayLength: 10 })}`,
      );
    } else {
      explanation.push(message);
    }

    return explanation.join("\n");
  }

  if (name === "DataCloneError") {
    return `structuredClone() a rejeté cette valeur : elle contient un objet que cette API ne sait pas cloner. ${message}`;
  }

  return `Le test a levé ${name}. ${message}`;
}

async function sourceExcerpt(location) {
  if (!location) return null;

  let source;
  try {
    source = await readFile(location.file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EACCES") return null;
    throw error;
  }

  const lines = source.split(/\r?\n/);
  if (location.line < 1 || location.line > lines.length) return null;

  const start = Math.max(1, location.line - 3);
  const end = Math.min(lines.length, location.line + 3);
  const width = String(end).length;
  const excerpt = [];

  for (let lineNumber = start; lineNumber <= end; lineNumber++) {
    const code = `${String(lineNumber).padStart(width)} | ${lines[lineNumber - 1]}`;
    excerpt.push({
      lineNumber,
      code,
      highlighted: lineNumber === location.line,
    });
  }

  return excerpt;
}

function classifyOutcome(event) {
  const { data, type } = event;
  const error = data.details?.error;

  if (data.details?.type === "suite") return null;
  if (data.skip !== undefined) return "skipped";
  if (data.todo !== undefined) return "todo";

  if (type === "test:fail") {
    if (/cancel|abort/i.test(error?.failureType ?? "")) return "cancelled";
    if (error?.failureType === "subtestsFailed") return null;
    return "failed";
  }

  if (type === "test:pass" && data.details?.type !== "suite") {
    return "passed";
  }

  return null;
}

function normalizeCounts(sourceCounts, outcomes) {
  if (sourceCounts && Number.isInteger(sourceCounts.tests)) {
    return {
      passed: sourceCounts.passed ?? 0,
      failed: sourceCounts.failed ?? 0,
      skipped: sourceCounts.skipped ?? 0,
      todo: sourceCounts.todo ?? 0,
      cancelled: sourceCounts.cancelled ?? 0,
      total: sourceCounts.tests,
    };
  }

  const counts = {
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    cancelled: 0,
    total: 0,
  };

  for (const outcome of outcomes) {
    counts[outcome.status]++;
    counts.total++;
  }

  return counts;
}

function statusMark(status, enabled) {
  if (status === "passed") return colorize("✓", "green", enabled);
  if (status === "failed") return colorize("✗", "red", enabled);
  return colorize("!", "yellow", enabled);
}

function collectOutcomes(events) {
  const queuedTypes = new Map();
  const suitesByFile = new Map();
  const groups = new Map();
  const outcomes = [];
  const failures = [];

  for (const event of events) {
    const { data, type } = event;
    const file = eventFile(data);
    const fileKey = file ?? "(fichier inconnu)";

    if (type === "test:enqueue") {
      queuedTypes.set(eventKey(data), data.type);
      continue;
    }

    if (type === "test:start") {
      if (queuedTypes.get(eventKey(data)) === "suite" && file) {
        const suiteLevels = suitesByFile.get(file) ?? new Map();
        suiteLevels.set(data.nesting, data.name);
        suitesByFile.set(file, suiteLevels);
      }
      continue;
    }

    if (type !== "test:pass" && type !== "test:fail") continue;

    const status = classifyOutcome(event);
    if (!status) continue;

    const suiteLevels = suitesByFile.get(file) ?? new Map();
    const suitePath = [...suiteLevels.entries()]
      .filter(([nesting]) => nesting < data.nesting)
      .sort(([left], [right]) => left - right)
      .map(([, name]) => name);
    const outcome = {
      status,
      name: data.name,
      suitePath,
      file,
      fileKey,
      error: data.details?.error,
    };

    outcomes.push(outcome);

    if (!groups.has(fileKey)) {
      groups.set(fileKey, { file, outcomes: [] });
    }
    groups.get(fileKey).outcomes.push(outcome);

    if (status === "failed") {
      failures.push(outcome);
    }
  }

  return { groups, outcomes, failures };
}

async function formatFailures(failures, cwd, enabled) {
  if (failures.length === 0) return "";

  const lines = [
    "",
    colorize("DÉTAIL DES ÉCHECS", "red", enabled),
    colorize("━".repeat(34), "dim", enabled),
  ];

  for (const failure of failures) {
    const location = failureLocation(failure.error, failure.file);
    const file = location?.file ?? failure.file;
    const fullName = [...failure.suitePath, failure.name].join(" > ");

    lines.push(
      "",
      `${colorize("✗ TEST ÉCHOUÉ :", "red", enabled)} ${fullName}`,
      `Fichier : ${displayPath(file, cwd)}`,
      `Ligne : ${location?.line ?? "non fournie par la stack de l’erreur"}`,
      "",
      "Explication :",
      describeFailure(failure.error),
      "",
      "Extrait de code :",
    );

    const excerpt = await sourceExcerpt(location);
    if (!excerpt) {
      lines.push("  Aucun extrait : Node.js n’a fourni aucune ligne source fiable.");
      continue;
    }

    for (const item of excerpt) {
      if (item.highlighted) {
        lines.push(
          `${colorize("→", "red", enabled)} ${colorize(item.code, "red", enabled)}`,
        );
      } else {
        lines.push(`  ${item.code}`);
      }
    }
  }

  return lines.join("\n");
}

export async function formatTestRun(
  events,
  {
    counts: sourceCounts,
    cwd = process.cwd(),
    colorsEnabled = terminalColorsEnabled(),
  } = {},
) {
  const { groups, outcomes, failures } = collectOutcomes(events);
  const counts = normalizeCounts(sourceCounts, outcomes);
  const lines = [];

  for (const [fileKey, group] of groups) {
    lines.push(colorize(`📁 ${displayPath(group.file, cwd) || fileKey}`, "cyan", colorsEnabled));

    let previousSuitePath = [];
    for (const outcome of group.outcomes) {
      let commonPrefix = 0;
      while (
        commonPrefix < previousSuitePath.length &&
        commonPrefix < outcome.suitePath.length &&
        previousSuitePath[commonPrefix] === outcome.suitePath[commonPrefix]
      ) {
        commonPrefix++;
      }

      for (let index = commonPrefix; index < outcome.suitePath.length; index++) {
        lines.push(
          `${"  ".repeat(index + 1)}${colorize(`📁 ${outcome.suitePath[index]}`, "cyan", colorsEnabled)}`,
        );
      }

      lines.push(
        `${"  ".repeat(outcome.suitePath.length + 1)}${statusMark(outcome.status, colorsEnabled)} ${outcome.name}`,
      );
      previousSuitePath = outcome.suitePath;
    }

    lines.push("");
  }

  const failureDetails = await formatFailures(failures, cwd, colorsEnabled);
  if (failureDetails) lines.push(failureDetails);

  const ignored = counts.skipped;
  lines.push(
    "",
    colorize("━".repeat(34), "dim", colorsEnabled),
    colorize("RÉSUMÉ DES TESTS", "cyan", colorsEnabled),
    "",
    `${colorize("✗ Tests ratés     :", "red", colorsEnabled)} ${counts.failed}`,
    `${colorize("! Tests ignorés   :", "yellow", colorsEnabled)} ${ignored}`,
    `${colorize("✓ Tests réussis   :", "green", colorsEnabled)} ${counts.passed}`,
  );

  if (counts.todo > 0) {
    lines.push(`${colorize("! Tests TODO      :", "yellow", colorsEnabled)} ${counts.todo}`);
  }
  if (counts.cancelled > 0) {
    lines.push(`${colorize("! Tests annulés   :", "yellow", colorsEnabled)} ${counts.cancelled}`);
  }

  lines.push(
    "",
    `Total              : ${counts.total}`,
    colorize("━".repeat(34), "dim", colorsEnabled),
  );

  return lines.join("\n");
}

export default async function* nodeTestReporter(source) {
  let events = [];
  let reportCount = 0;

  for await (const event of source) {
    events.push(event);

    if (
      event.type === "test:summary" &&
      event.data.file === undefined
    ) {
      yield `${await formatTestRun(events, {
        counts: event.data.counts,
      })}\n`;
      events = [];
      reportCount++;
    }
  }

  if (events.length > 0 || reportCount === 0) {
    yield `${await formatTestRun(events)}\n`;
  }
}
