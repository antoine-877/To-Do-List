import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodeTestReporter, {
  formatTestRun,
} from "../scripts/node-test-reporter.js";

const temporaryDirectories = [];

after(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function createSourceFile(content) {
  const directory = await mkdtemp(join(tmpdir(), "todo-test-report-"));
  temporaryDirectories.push(directory);
  const file = join(directory, "statut.test.js");
  await writeFile(file, content, "utf8");
  return file;
}

function testEvent(type, data) {
  return { type, data };
}

function rootSummaryForReporter(counts) {
  return testEvent("test:summary", { file: undefined, counts });
}

async function* eventStream(events) {
  yield* events;
}

async function collectReporterOutput(events) {
  const chunks = [];
  for await (const chunk of nodeTestReporter(eventStream(events))) {
    chunks.push(chunk);
  }
  return chunks.join("");
}

describe("Rapport des tests Node.js", () => {
  it("affiche les tests réussis et ignorés sans les compter comme des échecs", async () => {
    const output = await formatTestRun(
      [
        testEvent("test:enqueue", {
          name: "Ajout des tâches",
          nesting: 0,
          file: "test/ajout.test.js",
          type: "suite",
        }),
        testEvent("test:start", {
          name: "Ajout des tâches",
          nesting: 0,
          file: "test/ajout.test.js",
        }),
        testEvent("test:pass", {
          name: "ajoute une tâche",
          nesting: 1,
          file: "test/ajout.test.js",
          details: { type: "test" },
        }),
        testEvent("test:pass", {
          name: "fonctionnalité à venir",
          nesting: 1,
          file: "test/ajout.test.js",
          skip: "en attente",
          details: { type: "test" },
        }),
      ],
      {
        counts: {
          tests: 2,
          passed: 1,
          failed: 0,
          skipped: 1,
          todo: 0,
          cancelled: 0,
        },
        cwd: process.cwd(),
        colorsEnabled: false,
      },
    );

    assert.match(output, /📁 Ajout des tâches/);
    assert.match(output, /✓ ajoute une tâche/);
    assert.match(output, /! fonctionnalité à venir/);
    assert.match(output, /Tests ratés\s+:\s+0/);
    assert.match(output, /Tests ignorés\s+:\s+1/);
    assert.match(output, /Tests réussis\s+:\s+1/);
    assert.match(output, /Total\s+:\s+2/);
  });

  it("affiche les détails et l’extrait réel de plusieurs échecs", async () => {
    const file = await createSourceFile(
      [
        "import assert from 'node:assert/strict';",
        "",
        "describe('Statut', () => {",
        "  it('ne clone pas la valeur', () => {",
        "    const tasks = [];",
        "    const backup = structuredClone(tasks);",
        "    assert.deepEqual(tasks, backup);",
        "  });",
        "});",
      ].join("\n"),
    );
    const stack = `DataCloneError: donnée non clonable\n    at TestContext.<anonymous> (${file}:6:20)`;
    const error = {
      name: "DataCloneError",
      message: "donnée non clonable",
      stack,
    };
    const output = await formatTestRun(
      [
        testEvent("test:enqueue", {
          name: "Statut",
          nesting: 0,
          file,
          type: "suite",
        }),
        testEvent("test:start", {
          name: "Statut",
          nesting: 0,
          file,
        }),
        testEvent("test:fail", {
          name: "ne clone pas la valeur",
          nesting: 1,
          file,
          details: { type: "test", error },
        }),
        testEvent("test:fail", {
          name: "autre échec",
          nesting: 1,
          file,
          details: {
            type: "test",
            error: {
              name: "AssertionError",
              message: "les valeurs ne correspondent pas",
              actual: 1,
              expected: 2,
              stack: `AssertionError: les valeurs ne correspondent pas\n    at TestContext.<anonymous> (${file}:7:5)`,
            },
          },
        }),
      ],
      {
        counts: {
          tests: 2,
          passed: 0,
          failed: 2,
          skipped: 0,
          todo: 0,
          cancelled: 0,
        },
        cwd: process.cwd(),
        colorsEnabled: false,
      },
    );

    assert.match(output, /TEST ÉCHOUÉ : Statut > ne clone pas la valeur/);
    assert.match(output, /Fichier : .*statut\.test\.js/);
    assert.match(output, /Ligne : 6/);
    assert.match(output, /structuredClone\(\) a rejeté cette valeur/);
    assert.match(output, /→\s+6 \|     const backup = structuredClone\(tasks\);/);
    assert.match(output, /TEST ÉCHOUÉ : autre échec/);
    assert.match(output, /Valeur attendue : 2/);
    assert.match(output, /Valeur obtenue : 1/);
    assert.match(output, /Tests ratés\s+:\s+2/);
  });

  it("n’invente pas de numéro de ligne quand la stack n’en fournit pas", async () => {
    const output = await formatTestRun(
      [
        testEvent("test:fail", {
          name: "échec sans stack locale",
          nesting: 0,
          file: "test/ajout.test.js",
          details: {
            type: "test",
            error: { name: "Error", message: "échec" },
          },
        }),
      ],
      {
        counts: {
          tests: 1,
          passed: 0,
          failed: 1,
          skipped: 0,
          todo: 0,
          cancelled: 0,
        },
        cwd: process.cwd(),
        colorsEnabled: false,
      },
    );

    assert.match(output, /Ligne : non fournie par la stack de l’erreur/);
    assert.match(output, /aucune ligne source fiable/);
    assert.doesNotMatch(output, /→\s+\d+\s+\|/);
  });

  it("affiche un résumé à zéro quand aucun test n’est exécuté", async () => {
    const output = await formatTestRun([], {
      counts: {
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        todo: 0,
        cancelled: 0,
      },
      colorsEnabled: false,
    });

    assert.match(output, /Tests ratés\s+:\s+0/);
    assert.match(output, /Tests ignorés\s+:\s+0/);
    assert.match(output, /Tests réussis\s+:\s+0/);
    assert.match(output, /Total\s+:\s+0/);
  });

  it("utilise les compteurs agrégés du runner pour chaque exécution", async () => {
    const output = await collectReporterOutput([
      testEvent("test:summary", {
        file: "test/ajout.test.js",
        counts: { tests: 10, passed: 10, failed: 0, skipped: 0 },
      }),
      rootSummaryForReporter({
        tests: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        todo: 0,
        cancelled: 0,
      }),
    ]);

    assert.equal((output.match(/RÉSUMÉ DES TESTS/g) ?? []).length, 1);
    assert.match(output, /Tests réussis\s+:\s+1/);
    assert.match(output, /Total\s+:\s+1/);
  });

  it("active les couleurs ANSI uniquement lorsque le terminal le demande", async () => {
    const events = [
      testEvent("test:pass", {
        name: "test coloré",
        nesting: 0,
        file: "test/ajout.test.js",
        details: { type: "test" },
      }),
    ];

    const output = await formatTestRun(events, {
      counts: {
        tests: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        todo: 0,
        cancelled: 0,
      },
      colorsEnabled: true,
    });

    assert.match(output, /\u001b\[32m✓\u001b\[0m/);
  });
});
