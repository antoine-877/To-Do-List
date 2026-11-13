import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { effectScope, nextTick, ref } from "vue";
import { useLocalStorage } from "../src/composables/useLocalStorage.js";
import { createTask } from "./helpers.js";

const originalLocalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);
const scopes = [];

afterEach(() => {
  for (const scope of scopes.splice(0)) {
    scope.stop();
  }

  if (originalLocalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
  } else {
    delete globalThis.localStorage;
  }
});

function installLocalStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
    },
  });

  return values;
}

function startPersistence(storageKey, data) {
  const scope = effectScope();
  scopes.push(scope);
  scope.run(() => useLocalStorage(storageKey, data));
}

describe("Persistance dans le navigateur", () => {
  it("restaure les tâches déjà sauvegardées", () => {
    const savedTasks = [createTask(4, "Tâche restaurée")];
    installLocalStorage({ tasks: JSON.stringify(savedTasks) });
    const tasks = ref([]);

    startPersistence("tasks", tasks);

    assert.deepEqual(tasks.value, savedTasks);
  });

  it("enregistre les changements réactifs après leur mise à jour", async () => {
    const storage = installLocalStorage();
    const tasks = ref([]);
    startPersistence("tasks", tasks);

    tasks.value.push(createTask(1, "Tâche sauvegardée"));
    await nextTick();

    assert.equal(
      storage.get("tasks"),
      JSON.stringify([createTask(1, "Tâche sauvegardée")]),
    );
  });
});
