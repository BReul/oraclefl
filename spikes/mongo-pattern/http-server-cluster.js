/*eslint-disable no-console, guard-for-in*/
"use strict";

const cluster = require('cluster'),
    R = require('ramda'),
    config = require('./config.js')[(process.env['ENV'] || 'development')],
    server = require('./server.js');

console.log('configuring: ' + (process.env['ENV'] || 'development'));

let startServer = function () {
    server.startServer(config);
};

let startMultiCore = function() {

    let onExit = function(worker, exitCode) {
        console.log('worker ' + worker.process.pid + ' died');
        if (1 === worker.id) {
            // the zk registered worker died; kill the other workers.
            for (let id in cluster.workers) {
                cluster.workers[id].kill();
            }

            // exit the master process
            process.exit(exitCode);
        }
    };

    let forkWorkers = function(numProcesses) {
        for (let i = 0; i < numProcesses; i++) {
            let w = cluster.fork({processIdentity: i });

            console.log('starting processIdentity: ' + i +
                ' workerId:' + w.workerId +
                ' processId:' + w.process.pid);
        }

        cluster.on('exit', onExit);
    };

    if (cluster.isMaster) {
        forkWorkers(config.multiCoreProcesses);
    } else {
        startServer();
    }
};

if (config.singleCore || R.isNil(config.singleCore)) {
    process.env['processIdentity'] = 'single core';
    startServer();
} else {
    startMultiCore();
}
