import assert from "node:assert/strict";
import { ref } from "vue";
import { describe, it } from "node:test";
import { useTodolistStats } from "../src/composables/useTodolistStats.js";
import { createTask } from "./helpers.js";

describe("Compteurs des tâches", () => {
  it("compte le total, les tâches terminées et celles en cours", () => {
    const tasks = ref([
      createTask(1, "En cours"),
      createTask(2, "Terminée", 2, true),
      createTask(3, "En cours aussi"),
    ]);
    const { taskCount, taskCountTrue, taskCountFalse } =
      useTodolistStats(tasks);

    assert.equal(taskCount.value, 3);
    assert.equal(taskCountTrue.value, 1);
    assert.equal(taskCountFalse.value, 2);
  });

  it("actualise les compteurs après une modification", () => {
    const tasks = ref([createTask(1, "Une tâche")]);
    const { taskCount, taskCountTrue, taskCountFalse } =
      useTodolistStats(tasks);

    tasks.value[0].statu = true;

    assert.equal(taskCount.value, 1);
    assert.equal(taskCountTrue.value, 1);
    assert.equal(taskCountFalse.value, 0);
  });
});
