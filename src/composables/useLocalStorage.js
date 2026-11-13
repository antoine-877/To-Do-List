import { watch, isRef } from "vue";

export function useLocalStorage(storageKey, reactiveData) {
  let savedData;

  // Lecture du LocalStorage.
  try {
    savedData = localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Erreur de lecture du LocalStorage :", error);
  }

  // Restauration uniquement si une donnée existe.
  if (savedData !== null && savedData !== undefined) {
    let parsedData;
    let canRestore = false;

    try {
      parsedData = JSON.parse(savedData);

      const initialValue = isRef(reactiveData)
        ? reactiveData.value
        : reactiveData;

      // Vérification du type de donnée.
      canRestore = Array.isArray(initialValue)
        ? Array.isArray(parsedData)
        : typeof initialValue === "number"
          ? Number.isFinite(parsedData)
          : false;
    } catch (error) {
      console.error("Erreur de conversion JSON :", error);
    }

    if (canRestore) {
      // Restauration de la donnée réactive.
      if (isRef(reactiveData)) {
        reactiveData.value = parsedData;
      } else if (Array.isArray(reactiveData)) {
        reactiveData.splice(0, reactiveData.length, ...parsedData);
      }
    } else {
      console.warn("Donnée incompatible dans le LocalStorage :", storageKey);
    }
  }

  // Surveillance et sauvegarde.
  watch(
    reactiveData,
    (newValue) => {
      try {
        const serializedData = JSON.stringify(newValue);

        localStorage.setItem(storageKey, serializedData);
      } catch (error) {
        console.error("Erreur de sauvegarde dans le LocalStorage :", error);
      }
    },
    { deep: true },
  );
}
