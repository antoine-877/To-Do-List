<script setup>
import { computed } from "vue";
import TodoItem from "./TodoItem.vue";

// ----------------------------
// Props reçues depuis App.vue
// ----------------------------

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  canUseManualSort: {
    type: Boolean,
    required: true,
  },
  filterRestriction: {
    type: String,
    required: true,
  },
});

// ----------------------------
// Événements transmis à App.vue
// ----------------------------

const emit = defineEmits([
  "demanderSuppression",
  "demanderChangementStatut",
  "demanderMontee",
  "demanderDescente",
  "demanderChangementTri",
]);

// ----------------------------
// Compteurs
// ----------------------------

const taskCount = computed(() => props.tasks.length);

const taskCountTrue = computed(
  () => props.tasks.filter((task) => task.statu).length,
);

const taskCountFalse = computed(
  () => props.tasks.filter((task) => !task.statu).length,
);
</script>

<template>
  <div class="todo-list-content">
    <!-- Sélection du tri -->

    <section class="tri">
      <label for="tri">Trier les tâches :</label>

      <select
        id="tri"
        :value="props.filterRestriction"
        @change="emit('demanderChangementTri', $event.target.value)"
      >
        <option value="manuel">Ordre personnalisé</option>
        <option value="creation">Ordre de création</option>
        <option value="alphabetique-asc">Libellé A→Z</option>
        <option value="alphabetique-dsc">Libellé Z→A</option>
        <option value="terminee">Non terminées d'abord</option>
      </select>

      <p>
        Les flèches ⬆ et ⬇ fonctionnent uniquement avec le tri « Ordre
        personnalisé ».
      </p>
    </section>

    <!-- Compteurs -->

    <section class="compteurs">
      <p>Total : {{ taskCount }}</p>
      <p>Terminées : {{ taskCountTrue }}</p>
      <p>En cours : {{ taskCountFalse }}</p>
    </section>

    <!-- Liste des tâches -->

    <ul v-if="props.tasks.length" class="task-list">
      <TodoItem
        v-for="task in props.tasks"
        :key="task.id"
        :id="task.id"
        :description="task.description"
        :statu="task.statu"
        :canUseManualSort="props.canUseManualSort"
        @demanderSuppression="emit('demanderSuppression', $event)"
        @demanderChangementStatut="emit('demanderChangementStatut', $event)"
        @demanderMontee="emit('demanderMontee', $event)"
        @demanderDescente="emit('demanderDescente', $event)"
      />
    </ul>

    <!-- Liste vide -->

    <p v-else class="empty-message">Aucune tâche à afficher</p>
  </div>
</template>

<style scoped>
/* ==================================================
   DARK ANGEL — TODO LIST
================================================== */

/* ---------- Bloc de tri ---------- */

.tri {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;

  min-width: 0;
  padding: clamp(12px, 2.5vw, 20px);

  background: rgba(20, 18, 28, 0.78);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.tri label {
  color: #e5ddf8;
  font-size: 0.9rem;
  font-weight: 600;
}

.tri select {
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
  cursor: pointer;
}

.tri select:focus {
  border-color: var(--violet);
  outline: none;
  box-shadow: 0 0 0 3px var(--violet-glow);
}

.tri select option {
  color: #eee9fa;
  background: #14121c;
}

.tri p {
  grid-column: 1 / -1;
  margin: 0;

  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.6;
}

/* ---------- Compteurs ---------- */

.compteurs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  margin: 24px 0;
}

.compteurs p {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
  min-height: 62px;
  margin: 0;
  padding: 14px 10px;

  color: #dcd3ef;
  background: linear-gradient(145deg, #191522, #100e16);

  border: 1px solid var(--border);
  border-radius: 12px;

  font-size: clamp(0.78rem, 1.5vw, 0.9rem);
  line-height: 1.5;
  text-align: center;
  overflow-wrap: anywhere;
}

/* ---------- Liste ---------- */

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  min-width: 0;
  margin: 0;
  padding: 0;

  list-style: none;
}

/* ---------- Message liste vide ---------- */

.empty-message {
  padding: 24px 12px;
  color: var(--muted);
  text-align: center;
}

/* ==================================================
   RESPONSIVE
================================================== */

@media (max-width: 700px) {
  .tri {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }

  .tri label,
  .tri select,
  .tri p {
    grid-column: 1;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .compteurs {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    margin: 18px 0;
  }

  .compteurs p {
    min-height: 0;
    padding: 12px;
    font-size: 0.88rem;
  }

  .tri {
    padding: 13px;
  }
}

/* ==================================================
   ACCESSIBILITÉ
================================================== */

@media (prefers-reduced-motion: reduce) {
  .tri *,
  .compteurs * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
