import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTodoHarness } from "./helpers.js";

describe("Ajout des tâches", () => {
  it("ajoute la description nettoyée avec le prochain identifiant", () => {
    const { tasks, nextId, error, actions } = createTodoHarness([]);

    actions.create("  Préparer le projet  ");

    assert.deepEqual(tasks.value, [
      { id: 1, description: "Préparer le projet", statu: false, order: 1 },
    ]);
    assert.equal(nextId.value, 2);
    assert.equal(error.value, "");
  });

  it("refuse une description vide et affiche une erreur", () => {
    const { tasks, nextId, error, actions } = createTodoHarness([]);
    error.value = "Ancienne erreur";

    actions.create("   ");

    assert.deepEqual(tasks.value, []);
    assert.equal(nextId.value, 1);
    assert.equal(error.value, "Veuillez saisir une tâche.");
  });
});
