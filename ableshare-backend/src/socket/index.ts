import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
 io = new Server(server, {
  cors: {
    origin: "https://able-share1.vercel.app",
    credentials: true,
  },
});


  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // STEP 1.1: USER JOINS THEIR OWN ROOM
    socket.on("join-user", (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
