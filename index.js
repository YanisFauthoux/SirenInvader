// index.js

const cluster = require('cluster');
const fs = require('fs');

const startTime = new Date();

// Lire le fichier process.json
const processConfig = JSON.parse(fs.readFileSync('process.json', 'utf8'));
const numWorkers = parseInt(processConfig.apps.find(app => app.name === 'indexation').instances);

if (cluster.isMaster) {
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const indexData = require('./indexData.js');
    
    // Récupérer l'ID du worker
    const workerId = cluster.worker.id;
    
    // Récupérer le nombre total de workers
    const totalWorkers = numWorkers;
    
    // Appeler la fonction indexData avec l'ID du worker et le nombre total de workers
    indexData(workerId, totalWorkers);
}

// Code pour mesurer le temps total d'indexation
const endTime = new Date();
const totalElapsedTime = (endTime - startTime) / 1000; // Convertir en secondes
console.log(`Temps total d'indexation : ${totalElapsedTime} secondes`);
