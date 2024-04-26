// index.js

const pm2 = require('pm2');
const mongoose = require('mongoose');
const fs = require('fs');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/sirene')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
    console.log('Connexion à MongoDB réussie.');
});

// Définition du schéma Mongoose
const sireneSchema = new mongoose.Schema({
    siren: String,
    nic: String,
    siret: String,
    dateCreationEtablissement: Date,
    dateDernierTraitementEtablissement: Date,
    typeVoieEtablissement: String,
    libelleVoieEtablissement: String,
    codePostalEtablissement: String,
    libelleCommuneEtablissement: String,
    codeCommuneEtablissement: String,
    dateDebut: Date,
    etatAdministratifEtablissement: String
});
console.log('test.');
// Modèle MongoDB
const Sirene = mongoose.model('sirene', sireneSchema);
console.log('test.');
// Indexation des données à partir des fichiers CSV fragmentés
const indexData = async () => {
    try {
        // Boucle sur les fichiers CSV fragmentés
        for (let i = 1; i <= 39; i++) {
            console.log(`test ${i}.`);
            const filePath = `D:\\S10\\bigdata\\StockEtablissement_utf8\\split\\part_${i}.csv`;
            const csvData = fs.readFileSync(filePath, 'utf8');
            console.log(`test ${i}.`);
            const rows = csvData.trim().split('\n').map(row => row.split(','));
            // Boucle sur les lignes du fichier CSV fragmenté
            for (const row of rows) {
                if (row[0] !== "siren") {

                console.log(row);
                // Gestion des valeurs de date invalides ou manquantes
                const dateCreation = row[4] !== 'Invalid Date' ? new Date(row[4]) : null;
                const dateDernierTraitement = row[8] !== 'Invalid Date' ? new Date(row[8]) : null;
                const dateDebut = row[44] !== 'Invalid Date' ? new Date(row[44]) : null;
                // Vérification si au moins une des dates est invalide
                if (!dateCreation || dateCreation.toString() === 'Invalid Date' || !dateDernierTraitement || dateDernierTraitement.toString() === 'Invalid Date' || !dateDebut || dateDebut.toString() === 'Invalid Date') {
                    console.log(`Ligne ignorée : valeurs de date invalides.`);
                    continue; // Ignorer cette ligne et passer à la suivante
                }
                // Création d'un document Sirene pour chaque ligne du CSV
                const sirene = new Sirene({
                    siren: row[0],
                    nic: row[1],
                    siret: row[2],
                    dateCreationEtablissement: new Date(row[4]),
                    dateDernierTraitementEtablissement: new Date(row[8]),
                    typeVoieEtablissement: row[16],
                    libelleVoieEtablissement: row[17],
                    codePostalEtablissement: row[18],
                    libelleCommuneEtablissement: row[19],
                    codeCommuneEtablissement: row[22],
                    dateDebut: new Date(row[44]),
                    etatAdministratifEtablissement: row[45]
                });
                console.log(row[0]);
                console.log(sirene);
                await sirene.save();
                console.log(`Données enregistrées pour le siret : ${row[2]}`);
            }
        }
        }
        console.log('Indexation terminée.');
    } catch (error) {
        console.error(`Erreur lors de l'indexation des données : ${error}`);
    }
};



// Démarrage de l'indexation
indexData();
