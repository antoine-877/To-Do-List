# ✧ ToDo-Liste

<p align="center">
  <strong>Une petite application pour organiser ses tâches au quotidien.</strong><br>
  <ins>Ajoutez, triez et suivez votre progression — vos tâches restent enregistrées dans votre navigateur.</ins>
</p>

<p align="center">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?logo=javascript&logoColor=111">
</p>

## ✨ Présentation

**ToDo-Liste** est une application monopage construite avec **Vue 3** et **Vite**. Elle permet de gérer une liste de tâches depuis une interface responsive au thème sombre et violet.

> Les tâches et le prochain identifiant sont sauvegardés dans le `localStorage` du navigateur : elles sont donc conservées après rechargement sur le même navigateur.

## 🚀 Fonctionnalités

| Fonctionnalité | Description |
| --- | --- |
| Ajouter une tâche | Saisissez une description ; les espaces superflus sont retirés. |
| Modifier son statut | Marquez une tâche comme terminée ou remettez-la en cours. |
| Supprimer une tâche | Retirez individuellement une tâche de la liste. |
| Choisir un tri | Ordre personnalisé, ordre de création, ordre alphabétique croissant ou décroissant, ou tâches non terminées en premier. |
| Réorganiser la liste | Déplacez une tâche vers le haut ou vers le bas lorsque le tri **Ordre personnalisé** est sélectionné. |
| Suivre la progression | Consultez le nombre total de tâches, terminées et en cours. |
| Retrouver ses tâches | Les tâches et le prochain identifiant sont enregistrés localement dans le navigateur. |

**Raccourci clavier :** appuyez sur <kbd>N</kbd> pour donner le focus au champ de saisie. Le raccourci est ignoré lorsque le focus est déjà dans un champ de texte ou que la touche est combinée avec <kbd>Ctrl</kbd>, <kbd>Alt</kbd> ou <kbd>Cmd</kbd>.

## 🧰 Technologies

| Outil | Utilisation |
| --- | --- |
| [Vue 3](https://vuejs.org/) | Interface réactive et composants |
| [Vite](https://vite.dev/) | Serveur de développement et compilation |
| JavaScript avec modules ES | Logique de l’application |
| `localStorage` | Persistance des tâches dans le navigateur |

## 📋 Prérequis

- **Node.js** : `^22.18.0` ou `>=24.12.0`
- **npm** : installé avec Node.js

## ⚡ Installation et démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite l’adresse locale affichée dans le terminal.

## 📦 Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarre le serveur de développement avec rechargement à chaud. |
| `npm run build` | Compile et optimise l’application pour la production dans `dist/`. |
| `npm run preview` | Sert localement la version compilée ; lancez d’abord `npm run build`. |

## 🧪 Tests automatisés

Lancez les commandes depuis la racine du projet. `npm test` exécute toutes les suites du dossier `test/` avec un rapport terminal personnalisé basé sur le reporter natif de `node:test`. Pour cibler un seul fichier, transmettez son chemin après `--`.

| Commande | Tests exécutés |
| --- | --- |
| `npm test` | Toutes les suites du dossier `test/`, avec les résultats regroupés par fichier et suite. |
| `npm test -- test/ajout.test.js` | Ajout : description, espaces superflus, identifiant et validation des valeurs vides. |
| `npm test -- test/suppression.test.js` | Suppression : retrait de la tâche choisie, réorganisation et effacement d’une ancienne erreur. |
| `npm test -- test/statut.test.js` | Statut : marquer une tâche terminée, la remettre en cours et ignorer un identifiant inconnu. |
| `npm test -- test/tri.test.js` | Tri : ordre personnalisé, création, ordre alphabétique, tâches en cours d’abord et déplacements manuels. |
| `npm test -- test/compteurs.test.js` | Compteurs : total, tâches terminées et en cours, actualisation après modification. |
| `npm test -- test/persistance.test.js` | Persistance : restauration des tâches et sauvegarde des changements dans le stockage local. |
| `npm run test:watch` | Toutes les suites, relancées après chaque modification et présentées avec le rapport personnalisé. |
| `npm run test:watch -- test/ajout.test.js` | Suite d’ajout uniquement, relancée après chaque modification. Remplacez le chemin par celui d’une autre suite pour la cibler. |

Le rapport affiche une **coche verte** pour un test réussi, un **! jaune** pour un test ignoré/TODO/annulé et une **croix rouge** pour un échec. Il indique le fichier, l’explication de chaque échec, et entoure la ligne issue de la stack réelle de Node.js. Si aucune ligne fiable n’est disponible, le rapport le précise et n’invente pas d’extrait. Le résumé utilise les compteurs transmis par le runner ; les tests TODO et annulés sont indiqués séparément lorsqu’ils existent. Les couleurs ANSI sont activées dans les terminaux compatibles et désactivées dans les sorties redirigées ou avec `NO_COLOR`.

Le rapport est implémenté dans `scripts/node-test-reporter.js`. Ses tests de formatage sont regroupés dans `test/rapport.test.js` ; les tests métier existants ne sont pas modifiés.

## 🗂️ Structure du projet

```text
.
├── public/                 # Ressources publiques
├── src/
│   ├── assets/             # Feuilles de style et ressources
│   ├── components/
│   │   ├── TodoForm.vue    # Saisie et ajout d’une tâche
│   │   ├── TodoItem.vue    # Affichage et actions d’une tâche
│   │   └── TodoList.vue    # Liste, tri et compteurs
│   ├── composables/
│   │   ├── useLocalStorage.js
│   │   ├── useTodolistActions.js
│   │   ├── useTodolistStats.js
│   │   └── useTodolistTri.js
│   ├── App.vue             # État et coordination de l’application
│   └── main.js             # Point d’entrée Vue
├── scripts/
│   └── node-test-reporter.js
├── test/                   # Tests automatisés organisés par fonctionnalité
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Présentation

L’interface utilise une palette **sombre**, avec des accents **violets**, et s’adapte aux petits écrans. Ce README privilégie une mise en forme compatible avec GitHub : titres, tableaux, gras, italique, soulignement HTML et badges colorés. Le choix de police et la couleur du texte restent contrôlés par la plateforme qui affiche le fichier.
