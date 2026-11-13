import { computed } from "vue";

export function useTodolistTri(tasks, filterRestriction) {
  const canUseManualSort = computed(() => {
    return filterRestriction.value === "manuel";
  });

  // ----------------------------
  // Tri des tâches
  // ----------------------------

  const sortedTasks = computed(() => {
    const liste = tasks.value;

    if (filterRestriction.value === "manuel") {
      return liste.toSorted((a, b) => a.order - b.order);
    }

    if (filterRestriction.value === "creation") {
      return liste.toSorted((a, b) => a.id - b.id);
    }

    if (filterRestriction.value === "alphabetique-asc") {
      return liste.toSorted((a, b) =>
        a.description.localeCompare(b.description, "fr", {
          sensitivity: "base",
        }),
      );
    }

    if (filterRestriction.value === "alphabetique-dsc") {
      return liste.toSorted((a, b) =>
        b.description.localeCompare(a.description, "fr", {
          sensitivity: "base",
        }),
      );
    }

    if (filterRestriction.value === "terminee") {
      return liste.toSorted((a, b) => {
        if (a.statu !== b.statu) {
          return Number(a.statu) - Number(b.statu);
        }

        return a.description.localeCompare(b.description, "fr", {
          sensitivity: "base",
        });
      });
    }

    return liste.toSorted((a, b) => a.order - b.order);
  });
  
  return {
    canUseManualSort,
    sortedTasks,
  };
}
