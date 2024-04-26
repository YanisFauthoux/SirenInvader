// index.js

const mongoose = require('mongoose');
const fs = require('fs');
const pm2 = require('pm2');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/sirene')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
    console.log('Connexion à MongoDB réussie.');
    // Démarrer l'indexation une fois que la connexion à MongoDB est établie
    indexData();
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

// Modèle MongoDB
const Sirene = mongoose.model('sirene', sireneSchema);

// Indexation des données à partir des fichiers CSV fragmentés
const indexData = async () => {
    try {
        // Indexation des données...
        for (let i = 1; i <= 39; i++) {
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

// Gestion de la pause et de la reprise du processus avec PM2
pm2.launchBus((err, bus) => {
    if (err) {
        console.error(`Erreur lors du lancement du bus PM2 : ${err}`);
        return;
    }

    bus.on('process:event', async (packet) => {
        const { process, event } = packet;
        if (event === 'online') {
            console.log(`Processus ${process.name} démarré.`);
            // Événement pour démarrer l'indexation lorsque le processus est en ligne
            indexData();
        } else if (event === 'pause') {
            console.log(`Processus ${process.name} en pause.`);
            // Ajoutez votre logique pour mettre le processus en pause...
        } else if (event === 'resume') {
            console.log(`Processus ${process.name} reprise.`);
            // Ajoutez votre logique pour reprendre le processus...
        }
    });
});

// Exportez votre fonction d'indexation si vous devez l'utiliser ailleurs dans votre application
module.exports = indexData;
