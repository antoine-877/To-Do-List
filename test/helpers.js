import { ref } from "vue";
import { useTodolistActions } from "../src/composables/useTodolistActions.js";
import { useTodolistTri } from "../src/composables/useTodolistTri.js";

export function createTask(id, description, order = id, statu = false) {
  return { id, description, order, statu };
}

export function createTodoHarness(initialTasks = [
  createTask(1, "Tâche A"),
  createTask(2, "Tâche B"),
  createTask(3, "Tâche C"),
]) {
  const tasks = ref(initialTasks);
  const nextId = ref(
    tasks.value.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1,
  );
  const error = ref("");
  const filterRestriction = ref("manuel");
  const { canUseManualSort, sortedTasks } = useTodolistTri(
    tasks,
    filterRestriction,
  );
  const actions = useTodolistActions({
    tasks,
    nextId,
    error,
    canUseManualSort,
    sortedTasks,
  });

  return {
    tasks,
    nextId,
    error,
    filterRestriction,
    canUseManualSort,
    sortedTasks,
    actions,
  };
}
