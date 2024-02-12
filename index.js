var http = require('http');
var fs = require('fs');
var path = require('path');
var ext = /[\w\d_-]+\.[\w\d]+$/;
const hostname = 'localhost';
const port = 3000;

// Define your server-side functions
function setTransportMode() {
    console.log('Server-side function 1 called');
    // Add your functionality here
}

function createTimeline() {
    console.log('Server-side function 2 called');
    // Add your functionality here
}

// Create server
http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('/var/nodejs/LED-Mesh-WebUI/html/index.html').pipe(res);
    } else if (req.url === '/setTransportMode' && req.method === 'POST') {
        setTransportMode();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server-side function 1 called');
    } else if (req.url === '/createTimeline' && req.method === 'POST') {
        createTimeline();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server-side function 2 called');
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
