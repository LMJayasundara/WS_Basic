const WebSocket = require('ws');
var http = require('http');
var express = require('express');
var app = express();
const PORT = 8080;
const connected_clients = new Map();

var server = new http.createServer({
}, app);

var wss = new WebSocket.Server({
    server,
    verifyClient: function (info, cb) {
        var clientID = Buffer.from(info.req.headers.authorization,'base64').toString('utf-8');
        info.req.identity = clientID;
        cb(true, 200, 'Authorized');
    }
});

const heartbeat = (client) => {
    console.log("Pong from client: "+ client.id);
    client.isAlive = true;
};

const ping = (client) => {
    // do some stuff
    console.log("Ping to client: " + client.id);
};

wss.on('connection', function (ws, request) {
    ws.id = request.identity;
    console.log("Connected Charger ID: "  + ws.id);

    ws.isAlive = true;
    connected_clients.set(ws.id, ws);

    ws.on('message', async function (msg) {
        return new Promise(function(resolve, reject) {
            const ccc = Array.from(wss.clients).find(client => (client.readyState === client.OPEN && client.id == request.identity));
            resolve(ccc)
        }).then((client)=>{
            if(client != undefined){
                ws.on('pong', () => { heartbeat(client) });
                console.log("From client",ws.id,": ", msg.toString());
                client.send(JSON.stringify("Hello from server"));
            }
            else{
                client.terminate();
                console.log("Client Undefined!");
            }
        });
    });

    ws.on('close', function () {
        // ws.terminate();
        // connected_clients.delete(ws.id);
        console.log(ws.id + ' Client disconnected');
    });

});

const interval = setInterval(() => {
    console.log("Try to ping...");
    
    // wss.clients.forEach((client) => {
    Array.from(connected_clients.values()).forEach((client) => {
        if (client.isAlive === false) {
            connected_clients.delete(client.id);
            console.log("Terminate Client:", client.id);
            return client.terminate();
        };

        client.isAlive = false;
        client.ping(() => { ping(client) });
    });
}, 5000);

wss.on('close', function close() {
    clearInterval(interval);
});

server.listen(PORT, ()=>{
    console.log( (new Date()) + " Server is listening on port " + PORT);
});