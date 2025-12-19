import { io } from "socket.io-client";

export const socket = io("https://ableshare1.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});


socket.on("connect", () => {
  console.log("🟢 FRONTEND SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 FRONTEND SOCKET DISCONNECTED");
});
