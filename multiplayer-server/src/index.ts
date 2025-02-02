import { createServer } from "http";
import { createReadStream } from "fs";
import { Server } from "socket.io";
import { networkInterfaces } from "os";

import { workflow } from "./workflow";
import { User, Room } from "./types";

/** Use the networkInterfaces array to find the IP address of this machine */
function getIpAddress() {
  for (let adapter of Object.values(networkInterfaces()))
    for (let info of adapter ?? [])
      if (info.family === 'IPv4' && !info.internal)
        return info.address;
  process.exit();
}

/** The port where this server will listen */
const port = 3000;

// Get the address of this machine and print it
let socket_server_address = getIpAddress();
console.log(`MultiPlayerServer Address: ${socket_server_address}:${port}`);

// Make sure we've got a command-line argument
if (process.argv.length != 3) {
  console.log("Error: correct usage is npm start <addr:port>, where <addr:port> is the address and port of the web server")
  process.exit();
}
let web_server_address = process.argv[2];
console.log(`Remote Web Server Address: ${web_server_address}`);

// Set up a web server but don't start it yet
//
// NB: We have three routes in the server, all of which only exist for the sake
// of the demo.  Otherwise, we could have an empty server.
let app = createServer((req, res) => {
  // Route '/' and '/index.html' to the index.html file
  if (req.url == '/' || req.url == '/index.html') {
    res.writeHead(200, { "Context-Type": "text/html" });
    createReadStream(__dirname + '/index.html').pipe(res);
  }
  // Route '/socket.io.js' to the copy of the socket.io library in
  // node_modules
  else if (req.url == '/socket.io.js') {
    res.writeHead(200, { "Context-Type": "text/javascript" });
    createReadStream(__dirname + '/socket.io.js').pipe(res);
  }
  // Use 404.html for everything else
  else {
    res.writeHead(404, { "Context-Type": "text/html" });
    createReadStream('./404.html').pipe(res);
  }
});

/** The main user table, indexed by userId */
let users = new Map<string, User>();

/** The table of rooms, indexed by roomId */
let rooms = new Map<string, Map<string, Room>>();

/** A table for reverse lookup of users from socket ids */
let sockets = new Map<string, User>();

// Set up a websocket interface so that players can interact with each other
let io = new Server(app, { cors: { origin: `http://${web_server_address}` } });
io.on('connection', (socket) => { workflow(socket, users, rooms, sockets); });

// Now call listen to actually start the web server
app.listen(port);
