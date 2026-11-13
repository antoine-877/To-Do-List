import { computed } from "vue";

// ----------------------------
// Compteurs
// ----------------------------

export function useTodolistStats(tasks) {

  const taskCount = computed(() => tasks.value.length);

  const taskCountFalse = computed(
    () => tasks.value.filter((task) => !task.statu).length,
  );

  const taskCountTrue = computed(
    () => tasks.value.filter((task) => task.statu).length,
  );
  return {
    taskCount,
    taskCountFalse,
    taskCountTrue
  };
}