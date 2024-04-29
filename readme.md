# Documentation du Processus d'Indexation

## Introduction
Ce document décrit le processus d'indexation de données à partir de fichiers CSV dans une base de données MongoDB. Le processus est implémenté en JavaScript et utilise Node.js et MongoDB.

## Index.js
Le fichier `index.js` coordonne le processus d'indexation en utilisant le module `cluster` pour gérer les tâches en parallèle. Il charge également la configuration à partir du fichier `process.json` et invoque le fichier `indexData.js` pour chaque instance de travail.

### Fonctionnalités
- Création de travailleurs en fonction de la configuration spécifiée.
- Gestion des événements de fin de tâche.
- Calcul du temps total d'indexation.

## IndexData.js
Le fichier `indexData.js` contient la logique d'indexation des données CSV dans la base de données MongoDB.

### Fonctionnalités
- Connexion à la base de données MongoDB.
- Définition d'un schéma MongoDB pour les données à indexer.
- Lecture de fichiers CSV et traitement des données.
- Insertion des données indexées dans la base de données en utilisant les opérations en vrac.

### Paramètres
- `workerId`: L'identifiant du travailleur actuel.
- `totalWorkers`: Le nombre total de travailleurs en cours d'exécution.

### Étapes
1. Lecture du fichier CSV en fonction de l'identifiant du travailleur.
2. Extraction des données pertinentes.
3. Transformation des données en documents MongoDB.
4. Insertion des documents dans la base de données en utilisant des opérations en vrac.
5. Enregistrement du temps d'indexation.

## Documentation
- [Diagramme d’activité UML](./documentation/uml.drawio.pdf)
- [Topographie du cluster](./documentation/topographie.drawio.pdf)

## Conclusion
Ce processus d'indexation parallèle permet de traiter efficacement de grandes quantités de données à partir de fichiers CSV et de les stocker dans une base de données MongoDB. Il peut être adapté et configuré en fonction des besoins spécifiques de l'application.

