<script setup>
import { ref, computed } from "vue";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useTodolistTri } from "./composables/useTodolistTri";
import TodoList from "./components/TodoList.vue";
import TodoForm from "./components/TodoForm.vue";
import { useTodolistStats } from "./composables/useTodolistStats";

// ----------------------------
// Variable Local Storage
// ----------------------------

const CLE_LOCALSTORAGE_TASK = "todoliste:task";
const CLE_LOCALSTORAGE_NEXT_ID = "todoliste:nextId";

// ----------------------------
// Tableau des tâches
// ----------------------------

const tasks = ref([
  {
    id: 1,
    description: "Créer des tâches dans ma todo-list",
    statu: false,
    order: 1,
  },
  {
    id: 2,
    description: "Modifier ma todo-list",
    statu: false,
    order: 2,
  },
  {
    id: 3,
    description: "Supprimer des tâches de ma todo-list",
    statu: false,
    order: 3,
  },
]);

// ----------------------------
// Variables
// ----------------------------

const nextId = ref(4);
const error = ref("");
const filterRestriction = ref("manuel");
const isTodoFormVisible = ref(true);

// ----------------------------
// Persistance LocalStorage
// ----------------------------

useLocalStorage(CLE_LOCALSTORAGE_TASK, tasks);
useLocalStorage(CLE_LOCALSTORAGE_NEXT_ID, nextId);

// ----------------------------
// Validation des données restaurées
// ----------------------------

// Vérifie la validité des tâches restaurées.
if (
  Array.isArray(tasks.value) &&
  !tasks.value.every(
    (task) =>
      task !== null &&
      typeof task === "object" &&
      Number.isInteger(task.id) &&
      task.id > 0 &&
      typeof task.description === "string" &&
      typeof task.statu === "boolean" &&
      Number.isInteger(task.order) &&
      task.order > 0,
  )
) {
  tasks.value = [];
}

// Vérifie l'absence d'identifiants dupliqués.
if (new Set(tasks.value.map((task) => task.id)).size !== tasks.value.length) {
  tasks.value = [];
}

// Garantit un identifiant disponible.
const maxId = tasks.value.reduce((max, task) => Math.max(max, task.id), 0);

if (!Number.isInteger(nextId.value) || nextId.value <= 0) {
  nextId.value = maxId + 1;
} else {
  nextId.value = Math.max(nextId.value, maxId + 1);
}

// ----------------------------
// Statistiques des tâches
// ----------------------------

const { taskCount, taskCountFalse, taskCountTrue } = useTodolistStats(tasks);

// ----------------------------
// Tri des tâches
// ----------------------------

const { canUseManualSort, sortedTasks } = useTodolistTri(
  tasks,
  filterRestriction,
);

// ----------------------------
// Bool HaveTask
// ----------------------------

const haveTasks = computed(() => {
  return tasks.value.length > 0;
});

// ----------------------------
// Gestion du tri
// ----------------------------

const changeSort = (newSort) => {
  filterRestriction.value = newSort;
};

// ----------------------------
// Mise à jour des positions
// ----------------------------

const refreshOrder = () => {
  const orderedTasks = tasks.value.toSorted((a, b) => a.order - b.order);

  orderedTasks.forEach((task, index) => {
    task.order = index + 1;
  });
};

// ----------------------------
// Gestion des tâches
// ----------------------------

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
  const task = tasks.value.find((task) => task.id === id);

  if (!task) return;

  task.statu = !task.statu;
  error.value = "";
};

// ----------------------------
// Déplacement manuel
// ----------------------------

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
</script>

<template>
  <div class="todo-list">
    <h2>Exo Synthèse : ToDo-Liste</h2>

    <!-- Formulaire d'ajout -->
    <button
      class="toggle-form-button"
      @click="isTodoFormVisible = !isTodoFormVisible"
    >
      {{
        isTodoFormVisible ? "Masquer le formulaire" : "Afficher le formulaire"
      }}
    </button>
    <TodoForm
      v-if="isTodoFormVisible"
      @demanderAjoutTache="create"
      @demanderErreur="error = $event"
    />

    <!-- Message d'erreur -->
    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>

    <!-- Liste des tâches -->

    <TodoList
      v-if="haveTasks"
      :tasks="sortedTasks"
      :canUseManualSort="canUseManualSort"
      :filter-restriction="filterRestriction"
      @demanderSuppression="destroy"
      @demanderChangementStatut="finish"
      @demanderMontee="up"
      @demanderDescente="down"
      @demanderChangementTri="changeSort"
    />

    <p v-else>Aucune tâche à afficher</p>
  </div>
</template>

<style scoped>
/* ==================================================
   DARK ANGEL — PAGE PRINCIPALE
================================================== */

.todo-list {
  --bg: #0b0a10;
  --surface: #14121c;
  --surface-hover: #211b2d;
  --silver: #d9d5e5;
  --muted: #938ca5;
  --violet: #a78bfa;
  --violet-light: #c4b5fd;
  --violet-glow: rgba(167, 139, 250, 0.2);
  --border: rgba(204, 191, 235, 0.16);
  --danger: #ef8caa;
  --success: #a6e3c4;

  box-sizing: border-box;
  isolation: isolate;
  position: relative;
  width: calc(100% - 32px);
  max-width: 900px;
  min-width: 0;
  margin: clamp(16px, 4vw, 48px) auto;
  padding: clamp(16px, 4vw, 38px);
  overflow-wrap: anywhere;

  color: var(--silver);

  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(110, 76, 160, 0.2),
      transparent 55%
    ),
    linear-gradient(145deg, #111019, var(--bg) 70%);

  border: 1px solid var(--border);
  border-radius: clamp(14px, 3vw, 24px);

  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  font-family: Inter, "Segoe UI", sans-serif;
}

.todo-list *,
.todo-list *::before,
.todo-list *::after {
  box-sizing: border-box;
}

/* Halo céleste */

.todo-list::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: -95px;
  left: 50%;
  width: min(280px, 75%);
  height: 180px;
  transform: translateX(-50%);

  border: 1px solid rgba(199, 179, 255, 0.16);
  border-radius: 50%;

  box-shadow:
    0 0 50px rgba(167, 139, 250, 0.08),
    inset 0 0 35px rgba(167, 139, 250, 0.05);

  pointer-events: none;
}

/* Titre */

.todo-list h2 {
  margin: 0 0 28px;
  color: #f0ebff;

  font-size: clamp(1.25rem, 3vw, 2.2rem);
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: clamp(0.03em, 0.5vw, 0.12em);

  text-align: center;
  text-wrap: balance;

  text-shadow: 0 0 25px rgba(167, 139, 250, 0.3);
}

.todo-list h2::after {
  content: "✧ ───── ☾ ───── ✧";
  display: block;
  margin-top: 12px;

  color: var(--violet);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-shadow: none;
}

/* Bouton afficher / masquer le formulaire */

.toggle-form-button {
  min-height: 44px;
  margin-bottom: 16px;
  padding: 10px 22px;

  color: #100c19;
  background: linear-gradient(135deg, #e1d7ff, #a78bfa);

  border: 1px solid transparent;
  border-radius: 9px;

  font-family: inherit;
  font-weight: 700;
  cursor: pointer;

  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.toggle-form-button:hover {
  background: linear-gradient(135deg, #f1eaff, #c4b5fd);
  box-shadow: 0 0 25px rgba(167, 139, 250, 0.28);
}

.toggle-form-button:active {
  transform: scale(0.98);
}

.toggle-form-button:focus-visible {
  outline: 2px solid var(--violet);
  outline-offset: 3px;
}
</style>
