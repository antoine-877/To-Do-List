import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTask, createTodoHarness } from "./helpers.js";

describe("Suppression des tâches", () => {
  it("supprime uniquement la tâche choisie", () => {
    const { tasks, actions } = createTodoHarness([
      createTask(1, "Garder"),
      createTask(2, "Supprimer"),
      createTask(3, "Garder aussi"),
    ]);

    actions.destroy(2);

    assert.deepEqual(
      tasks.value.map((task) => task.description),
      ["Garder", "Garder aussi"],
    );
  });

  it("réattribue un ordre continu aux tâches restantes", () => {
    const { tasks, error, actions } = createTodoHarness([
      createTask(1, "En dernier", 3),
      createTask(2, "À retirer", 2),
      createTask(3, "En premier", 1),
    ]);
    error.value = "Ancienne erreur";

    actions.destroy(2);

    assert.deepEqual(
      tasks.value.toSorted((a, b) => a.order - b.order).map((task) => [
        task.description,
        task.order,
      ]),
      [
        ["En premier", 1],
        ["En dernier", 2],
      ],
    );
    assert.equal(error.value, "");
  });
});
