const WebSocket = require('ws');
const username = "ID001";
const URL = "ws://127.0.0.1:8080/";
var reconn = null;

function startWebsocket() {
    var ws = new WebSocket(URL, {
        perMessageDeflate: false,
        headers: {
            Authorization: Buffer.from(username).toString('base64'),
        },
    });

    ws.on('open', function() {
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