// worker.js

// Importer les dépendances nécessaires
const mongoose = require('mongoose');

// Connecter Mongoose à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Définir le schéma de votre modèle d'établissement
const establishmentSchema = new mongoose.Schema({
    // Schéma de votre modèle d'établissement
});

// Créer le modèle d'établissement à partir du schéma
const Establishment = mongoose.model('Establishment', establishmentSchema);

// Fonction pour insérer les données d'établissements dans la base de données
function insertEstablishmentsData(establishmentsData) {
    // Utiliser la méthode insertMany() de Mongoose pour insérer les données en masse
    Establishment.insertMany(establishmentsData)
        .then(() => {
            console.log('Données insérées avec succès !');
            // Utiliser l'API PM2 pour émettre des événements vers le contrôleur principal
            process.send({ type: 'indexing_progress', data: '100%' }); // Événement pour indiquer la fin de l'indexation
        })
        .catch((err) => {
            console.error('Erreur lors de l\'insertion des données :', err);
        });
}

// Exécuter la fonction pour insérer les données
const establishmentsData = [...] // Données à insérer
insertEstablishmentsData(establishmentsData);

// Placez ici le reste de la logique de votre worker, si nécessaire
