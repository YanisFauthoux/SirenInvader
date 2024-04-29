const cluster = require('cluster');
const fs = require('fs');

const startTime = new Date();

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
    
    const workerId = cluster.worker.id;
    
    const totalWorkers = numWorkers;
    
    indexData(workerId, totalWorkers);
}

const endTime = new Date();
const totalElapsedTime = (endTime - startTime) / 1000;
console.log(`Temps total d'indexation : ${totalElapsedTime} secondes`);
