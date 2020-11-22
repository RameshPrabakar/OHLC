#!/usr/bin/env node

/**
 * Module dependencies.
 */
let app = require('../server/app');
let debug = require('debug')('testapp:server');
let http = require('http');
const fs = require('fs');
const readline = require('readline');

const WebSocketServer = require('websocket').server;
global.tradArray = [];
global.requesCount = 0;  
global.lineNumber = 0;
let server;
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(5000);
app.set('port', port);

 /**
 * Create HTTP server.
 */

server = http.createServer(app);

/**
 * Listen on provided port.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        //console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        //console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

async function readFromN2M(filename, n, m) {
    const lineReader = readline.createInterface({
        input: fs.createReadStream(filename),
    });

    let lineNumber = 0;

    lineReader.on('line', function (line) {

        lineNumber++;

        if (lineNumber >= n && lineNumber < m) {
            let data = JSON.parse(line.toString('ascii'));
            global.tradArray.push(data);
        }

        if (lineNumber > m) {
            lineReader.close()
            lineReader.removeAllListeners();
            global.lineNumber = lineNumber;
        }
    });
}

/**
 * Web Socket creation
 */
const wsServer = new WebSocketServer({
    httpServer: server
});

global.number =0;
wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);

    connection.on('message', async (message) => {

        let {
            msg,
            type,
            seconds
        } = JSON.parse(message.utf8Data) || {};
                
        let endLine = global.lineNumber + 100;
        await readFromN2M('./resx/trades.json', global.lineNumber, endLine);

        connection.sendUTF(JSON.stringify(global.tradArray));        
        global.tradArray = [];
        global.requesCount++;
     });

    connection.on('close', (reasonCode, description) => {
        console.log('Client has disconnected.');
    });

});
