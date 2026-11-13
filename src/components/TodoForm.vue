<script setup>
import { ref, useTemplateRef, onMounted, onUnmounted } from "vue";

const newTask = ref("");
const taskInput = useTemplateRef("taskInput");

onMounted(() => {
  taskInput.value.focus();

  window.addEventListener("keydown", handleGlobalKeydown);

  // TEST
  // console.log("TodoForm monté : écouteur clavier installé");
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);

  // TEST
  // console.log("TodoForm démonté : écouteur clavier supprimé");
});

const handleGlobalKeydown = (event) => {
  // TEST
  // console.log("Événement clavier détecté :", event.key);

  if (event.key.toLowerCase() !== "n") return;
  if (event.target.matches("input, textarea")) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  event.preventDefault();
  taskInput.value.focus();
};

const emit = defineEmits(["demanderAjoutTache", "demanderErreur"]);

const gererSoumission = () => {
  const texteNettoye = newTask.value.trim();

  if (texteNettoye === "") {
    emit("demanderErreur", "Veuillez saisir une tâche.");
    return;
  }

  emit("demanderAjoutTache", texteNettoye);

  newTask.value = "";
};
</script>

<template>
  <form class="todo-form" @submit.prevent="gererSoumission">
    <input
      ref="taskInput"
      v-model="newTask"
      type="text"
      placeholder="Saisir une nouvelle tâche"
      aria-label="Nouvelle tâche"
    />

    <button type="submit" :disabled="!newTask.trim()">Ajouter</button>
  </form>
</template>

<style scoped>
/* Formulaire d'ajout */

.todo-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;

  width: 100%;
  min-width: 0;
  margin-bottom: 26px;
}

/* Champ de saisie */

.todo-form input {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 12px 14px;

  color: #eee9fa;
  background: rgba(8, 7, 13, 0.85);

  border: 1px solid var(--border);
  border-radius: 10px;

  font-family: inherit;
  font-size: 16px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.todo-form input::placeholder {
  color: #777086;
}

.todo-form input:focus {
  border-color: var(--violet);
  outline: none;
  box-shadow: 0 0 0 3px var(--violet-glow);
}

/* Bouton Ajouter */

.todo-form button {
  min-width: 100px;
  min-height: 44px;
  padding: 10px 22px;

  color: #100c19;
  background: linear-gradient(135deg, #e1d7ff, #a78bfa);

  border: 1px solid transparent;
  border-radius: 9px;

  font-weight: 700;
  cursor: pointer;
}

.todo-form button:hover:not(:disabled) {
  background: linear-gradient(135deg, #f1eaff, #c4b5fd);
  box-shadow: 0 0 25px rgba(167, 139, 250, 0.28);
}

.todo-form button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Responsive */

@media (max-width: 480px) {
  .todo-form {
    grid-template-columns: minmax(0, 1fr);
    gap: 9px;
    margin-bottom: 20px;
  }

  .todo-form input,
  .todo-form button {
    width: 100%;
  }
}
</style>
