// indexData.js

const fs = require('fs');
const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/sirene');
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

const Sirene = mongoose.model('sirene', sireneSchema);

const indexData = async (workerId, totalWorkers) => {
    try {
        for (let i = workerId; i <= 154; i += totalWorkers) {
            const startTime = new Date();
            let bulkOps = [];
            const filePath = `D:\\S10\\bigdata\\StockEtablissement_utf8\\split\\part_${i}.csv`;
            const csvData = fs.readFileSync(filePath, 'utf8');
            const rows = csvData.trim().split('\n').map(row => row.split(','));
            for (const row of rows) {
                if (row[0] !== "siren") {
                    // Gestion des valeurs de date invalides ou manquantes
                    const dateCreation = row[4] !== 'Invalid Date' ? new Date(row[4]) : null;
                    const dateDernierTraitement = row[8] !== 'Invalid Date' ? new Date(row[8]) : null;
                    const dateDebut = row[44] !== 'Invalid Date' ? new Date(row[44]) : null;
                    if (!dateCreation || dateCreation.toString() === 'Invalid Date' || !dateDernierTraitement || dateDernierTraitement.toString() === 'Invalid Date' || !dateDebut || dateDebut.toString() === 'Invalid Date') {
                        console.log(`Ligne ignorée : valeurs de date invalides.`);
                        continue;
                    }
                    // Ajoutez l'opération d'insertion au tableau en vrac
                    bulkOps.push({
                        insertOne: {
                            document: {
                                siren: row[0],
                                nic: row[1],
                                siret: row[2],
                                dateCreationEtablissement: dateCreation,
                                dateDernierTraitementEtablissement: dateDernierTraitement,
                                typeVoieEtablissement: row[16],
                                libelleVoieEtablissement: row[17],
                                codePostalEtablissement: row[18],
                                libelleCommuneEtablissement: row[19],
                                codeCommuneEtablissement: row[22],
                                dateDebut: dateDebut,
                                etatAdministratifEtablissement: row[45]
                            }
                        }
                    });
                }
            }
            await Sirene.bulkWrite(bulkOps);
            const endTime = new Date();
const elapsedTime = (endTime - startTime) / 1000;
console.log(`Temps d'indexation du fichier ${filePath}: ${elapsedTime} secondes`);

            console.log(`Indexation terminée pour le fichier ${filePath}`);
        }

        console.log(`Indexation terminée pour l'instance PM2 ${workerId}`);
    } catch (error) {
        console.error(`Erreur lors de l'indexation des données : ${error}`);
    }
};

module.exports = indexData;
