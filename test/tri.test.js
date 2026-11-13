import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTask, createTodoHarness } from "./helpers.js";

describe("Tri des tâches", () => {
  it("affiche l’ordre personnalisé sans modifier les données", () => {
    const initialTasks = [
      createTask(1, "Deuxième", 2),
      createTask(2, "Première", 1),
    ];
    const { tasks, sortedTasks } = createTodoHarness(initialTasks);

    assert.deepEqual(
      sortedTasks.value.map((task) => task.description),
      ["Première", "Deuxième"],
    );
    assert.deepEqual(
      tasks.value.map((task) => task.id),
      [1, 2],
    );
  });

  it("trie par ordre de création", () => {
    const { filterRestriction, sortedTasks } = createTodoHarness([
      createTask(2, "Créée en deuxième"),
      createTask(1, "Créée en premier"),
    ]);
    filterRestriction.value = "creation";

    assert.deepEqual(
      sortedTasks.value.map((task) => task.id),
      [1, 2],
    );
  });

  it("trie les descriptions dans les deux sens sans distinguer la casse", () => {
    const { filterRestriction, sortedTasks } = createTodoHarness([
      createTask(1, "Banane"),
      createTask(2, "abricot"),
    ]);

    filterRestriction.value = "alphabetique-asc";
    assert.deepEqual(
      sortedTasks.value.map((task) => task.description),
      ["abricot", "Banane"],
    );

    filterRestriction.value = "alphabetique-dsc";
    assert.deepEqual(
      sortedTasks.value.map((task) => task.description),
      ["Banane", "abricot"],
    );
  });

  it("place les tâches en cours avant les tâches terminées", () => {
    const { filterRestriction, sortedTasks } = createTodoHarness([
      createTask(1, "Terminée", 1, true),
      createTask(2, "En cours", 2, false),
    ]);
    filterRestriction.value = "terminee";

    assert.deepEqual(
      sortedTasks.value.map((task) => task.description),
      ["En cours", "Terminée"],
    );
  });

  it("n’autorise le déplacement manuel qu’avec le tri personnalisé", () => {
    const { canUseManualSort, filterRestriction } = createTodoHarness();

    assert.equal(canUseManualSort.value, true);
    filterRestriction.value = "creation";
    assert.equal(canUseManualSort.value, false);
  });
});

describe("Déplacement manuel", () => {
  it("monte et descend une tâche d’une place", () => {
    const { actions, sortedTasks } = createTodoHarness();

    actions.up(2);
    assert.deepEqual(
      sortedTasks.value.map((task) => task.id),
      [2, 1, 3],
    );

    actions.down(2);
    assert.deepEqual(
      sortedTasks.value.map((task) => task.id),
      [1, 2, 3],
    );
  });

  it("ne déplace pas une tâche au-delà des limites de la liste", () => {
    const { actions, sortedTasks } = createTodoHarness();

    actions.up(1);
    actions.down(3);

    assert.deepEqual(
      sortedTasks.value.map((task) => task.id),
      [1, 2, 3],
    );
  });

  it("refuse le déplacement lorsque le tri manuel est désactivé", () => {
    const { actions, error, filterRestriction, sortedTasks } =
      createTodoHarness();
    filterRestriction.value = "creation";

    actions.up(2);

    assert.deepEqual(
      sortedTasks.value.map((task) => task.id),
      [1, 2, 3],
    );
    assert.equal(error.value, "Le tri manuel est désactivé.");
  });
});
