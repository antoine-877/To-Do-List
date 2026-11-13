<script setup>
// ----------------------------
// Props reçues depuis App.vue
// ----------------------------

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  statu: {
    type: Boolean,
    required: true,
  },
  canUseManualSort: {
    type: Boolean,
    required: true,
  },
});

// ----------------------------
// Événements envoyés au parent
// ----------------------------

const emit = defineEmits([
  "demanderSuppression",
  "demanderChangementStatut",
  "demanderMontee",
  "demanderDescente",
]);

// ----------------------------
// Fonctions intermédiaires
// ----------------------------

const demanderSuppression = () => {
  emit("demanderSuppression", props.id);
};

const demanderChangementStatut = () => {
  emit("demanderChangementStatut", props.id);
};

const demanderMontee = () => {
  emit("demanderMontee", props.id);
};

const demanderDescente = () => {
  emit("demanderDescente", props.id);
};
</script>

<template>
  <li class="task-item">
    <span :class="{ barre: props.statu }">
      {{ props.description }}
    </span>

    <div class="actions">
      <button
        type="button"
        @click="demanderMontee"
        :disabled="!props.canUseManualSort"
        aria-label="Monter la tâche"
        title="Monter"
      >
        ⬆
      </button>

      <button
        type="button"
        @click="demanderDescente"
        :disabled="!props.canUseManualSort"
        aria-label="Descendre la tâche"
        title="Descendre"
      >
        ⬇
      </button>

      <button type="button" @click="demanderChangementStatut">✔</button>

      <button
        type="button"
        @click="demanderSuppression"
        :aria-label="`Supprimer la tâche : ${props.description}`"
      >
        🗑 Supprimer
      </button>
    </div>
  </li>
</template>

<style scoped>
/* Tâche individuelle */

.task-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;

  min-width: 0;
  margin: 0;
  padding: clamp(12px, 2.5vw, 18px);

  background: linear-gradient(
    110deg,
    rgba(30, 25, 41, 0.92),
    rgba(17, 15, 23, 0.96)
  );

  border: 1px solid var(--border);
  border-left: 3px solid #6f5b99;
  border-radius: 12px;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.task-item:hover {
  background: linear-gradient(110deg, #211a30, #17131f);
  border-color: rgba(167, 139, 250, 0.38);
  border-left-color: var(--violet);
}

/* Texte */

.task-item > span {
  display: block;
  min-width: 0;

  color: #e6e0f0;
  line-height: 1.65;

  overflow-wrap: anywhere;
}

/* Tâche terminée */

.barre {
  color: #827b91;
  text-decoration: line-through;
  text-decoration-color: var(--violet);
  text-decoration-thickness: 1px;
}

/* Boutons d'action */

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;

  min-width: 0;
  margin: 0;
}

.actions button {
  min-width: 42px;
  min-height: 42px;
  padding: 8px 10px;

  color: var(--silver);
  background: rgba(10, 9, 15, 0.65);

  border: 1px solid var(--border);
  border-radius: 9px;

  cursor: pointer;
  transition: 0.2s ease;
}

.actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--surface-hover);
  border-color: rgba(167, 139, 250, 0.65);
}

.actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Bouton terminer */

.actions button:nth-child(3) {
  color: var(--success);
}

/* Bouton supprimer */

.actions button:last-child {
  color: var(--danger);
}

.actions button:last-child:hover:not(:disabled) {
  border-color: rgba(239, 140, 170, 0.65);
  background: rgba(100, 35, 60, 0.25);
}

/* Responsive */

@media (max-width: 900px) {
  .task-item {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .task-item {
    gap: 12px;
    padding: 12px;
  }

  .task-item > span {
    font-size: 0.93rem;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    width: 100%;
  }

  .actions button {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 8px 5px;
    font-size: 0.85rem;
  }

  .actions button:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 340px) {
  .actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .actions button:last-child {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .task-item,
  .actions button {
    transition: none !important;
  }
}
</style>
