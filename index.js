var http = require('http');
var fs = require('fs');
const net = require('net');
var path = require('path');
var ext = /[\w\d_-]+\.[\w\d]+$/;
const hostname = 'localhost';
const port = 3000;

const pixeraIP = '10.10.10.105';
const pixeraPort = 1400;

// Create server
http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('/var/nodejs/LED-Mesh-WebUI/html/index.html').pipe(res);
    } else if (req.url === '/setTransportMode' && req.method === 'POST') {
        setTransportMode();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
    } else if (req.url === '/getTimelines' && req.method === 'POST') {
        getTimelines(res);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
    } else if (ext.test(req.url)) {
        fs.exists(path.join(__dirname, req.url), function (exists) {
            if (exists) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                fs.createReadStream('index.html').pipe(res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                fs.createReadStream('404.html').pipe(res);
            }
        });
    } else {
        //  add a RESTful service
    }
}).listen(port, hostname);


// Utility function for creating and handling TCP client connections
function createTcpClient(requestMessage, onSuccess, onError) {
    const client = new net.Socket();
    client.connect(pixeraPort, pixeraIP, () => {
        console.log('Connected, sending data...');
        client.write(requestMessage);
    });

    client.on('data', (data) => {
        onSuccess(data); // Process received data
        client.end(); // Close the connection
    });

    client.on('error', (err) => {
        console.error('TCP Client error:', err);
        onError(err);
    });
}

function setTransportMode() {
    const requestMessage = reqMsgSetTransportmodeForTimeline();

    createTcpClient(requestMessage, (data) => {
        console.log('Transport mode set successfully:', data.toString());
    });
}

// Request message for setting transport mode
function reqMsgSetTransportmodeForTimeline() {
    return JSON.stringify({
        "jsonrpc": "2.0",
        "id": 23,
        "method": "Pixera.Compound.setTransportModeOnTimelineAtIndex",
        "params": {
            "index": 0,
            "mode": 1
        }
    }) + "0xPX";
}

function getTimelines(res) {
    const requestMessage = reqMsgGetTimelines();
    let headersSent = false; // Flag to track if headers have been sent

    createTcpClient(requestMessage, (data) => {
        console.log('Received timeline data:', data.toString());
        //res.json(JSON.parse(data.toString().replace('0xPX', '')));
        const timelineHandles = JSON.parse(data.toString().replace('0xPX', '')).result
        console.log("Timeline Handles: ", timelineHandles);

    }, (err) => {
        res.status(500).send('Failed to fetch timelines');
    });
}

// Request message for getting timelines
function reqMsgGetTimelines() {
    return JSON.stringify({
        "jsonrpc": "2.0",
        "id": 341,
        "method": "Pixera.Timelines.getTimelines"
    }) + "0xPX";
}
