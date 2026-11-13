export function useTodolistActions({
  tasks,
  nextId,
  error,
  canUseManualSort,
  sortedTasks,
}) {
  const refreshOrder = () => {
    const orderedTasks = tasks.value.toSorted((a, b) => a.order - b.order);

    orderedTasks.forEach((task, index) => {
      task.order = index + 1;
    });
  };

  const create = (description) => {
    const texte = description.trim();

    if (!texte) {
      error.value = "Veuillez saisir une tâche.";
      return;
    }

    tasks.value.push({
      id: nextId.value,
      description: texte,
      statu: false,
      order: tasks.value.length + 1,
    });

    nextId.value++;
    error.value = "";
  };

  const destroy = (id) => {
    tasks.value = tasks.value.filter((task) => task.id !== id);

    error.value = "";
    refreshOrder();
  };

  const finish = (id) => {
    const task = tasks.value.find((item) => item.id === id);

    if (!task) return;

    task.statu = !task.statu;
    error.value = "";
  };

  const up = (id) => {
    if (!canUseManualSort.value) {
      error.value = "Le tri manuel est désactivé.";
      return;
    }

    const index = sortedTasks.value.findIndex((task) => task.id === id);

    if (index <= 0) return;

    const currentTask = sortedTasks.value[index];
    const previousTask = sortedTasks.value[index - 1];

    const tempOrder = currentTask.order;
    currentTask.order = previousTask.order;
    previousTask.order = tempOrder;

    error.value = "";
  };

  const down = (id) => {
    if (!canUseManualSort.value) {
      error.value = "Le tri manuel est désactivé.";
      return;
    }

    const index = sortedTasks.value.findIndex((task) => task.id === id);

    if (index < 0 || index >= sortedTasks.value.length - 1) return;

    const currentTask = sortedTasks.value[index];
    const nextTask = sortedTasks.value[index + 1];

    const tempOrder = currentTask.order;
    currentTask.order = nextTask.order;
    nextTask.order = tempOrder;

    error.value = "";
  };

  return {
    create,
    destroy,
    finish,
    up,
    down,
  };
}
