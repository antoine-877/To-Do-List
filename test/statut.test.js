import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTodoHarness } from "./helpers.js";

describe("Changement du statut", () => {
  it("marque une tâche en cours comme terminée", () => {
    const { tasks, actions } = createTodoHarness();

    actions.finish(1);

    assert.equal(tasks.value[0].statu, true);
  });

  it("permet de remettre une tâche terminée en cours", () => {
    const { tasks, actions } = createTodoHarness();
    tasks.value[0].statu = true;

    actions.finish(1);

    assert.equal(tasks.value[0].statu, false);
  });

  it("ne modifie rien si la tâche demandée n’existe pas", () => {
    const { tasks, actions } = createTodoHarness();
    const before = structuredClone(tasks.value);

    actions.finish(999);

    assert.deepEqual(tasks.value, before);
  });
});
