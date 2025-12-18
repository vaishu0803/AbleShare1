import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("🟢 FRONTEND SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 FRONTEND SOCKET DISCONNECTED");
});
