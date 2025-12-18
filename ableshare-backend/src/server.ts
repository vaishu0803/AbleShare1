import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { initSocket } from "./socket";


const PORT = process.env.PORT || 5000;

// create HTTP server
const server = http.createServer(app);

// init socket.io
initSocket(server);

// listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
