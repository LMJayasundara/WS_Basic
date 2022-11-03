const WebSocket = require('ws');
const username = "ID002";
const URL = "ws://127.0.0.1:8080/";
var reconn = null;

const heartbeat = (ws) => {
    console.log("ping to server");
    clearTimeout(ws.pingTimeout);
};

function startWebsocket() {
    var ws = new WebSocket(URL, {
        perMessageDeflate: false,
        headers: {
            Authorization: Buffer.from(username).toString('base64'),
        },
    });

    var ping = () => { heartbeat(ws) };
    
    ws.on('open', function() {
        ws.on('ping', ping);

        clearInterval(reconn);
        ws.send("Hello from client");
    });

    ws.on('message', function(msg) {
        var data = JSON.parse(msg);
        console.log(data);
    });

    ws.on('error', function (err) {
        console.log(err.message);
    });

    ws.on('close', function() {
        ws = null;
        reconn = setTimeout(startWebsocket, 5000);
    });
};

startWebsocket();