import http from "http";
import { Server } from "socket.io";

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {}; // { roomName: { players: Map, host: socketId, started: false } }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("room:join", ({ room, player }) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: new Map(),
        host: socket.id,
        started: false
      };
    }

    const gameRoom = rooms[room];

    if (gameRoom.started) {
      socket.emit("room:error", { message: "Game already started" });
      return;
    }

    gameRoom.players.set(socket.id, player);
    socket.join(room);

    if (!gameRoom.host) {
      gameRoom.host = socket.id;
    }

    io.to(room).emit("room:state", {
      players: [...gameRoom.players.entries()].map(([id, name]) => ({
        name,
        isHost: id === gameRoom.host
      })),
      started: gameRoom.started
    });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      const gameRoom = rooms[room];
      if (gameRoom.players.has(socket.id)) {
        gameRoom.players.delete(socket.id);

        if (gameRoom.host === socket.id) {
          const nextHost = gameRoom.players.keys().next().value;
          gameRoom.host = nextHost || null;
        }

        io.to(room).emit("room:state", {
          players: [...gameRoom.players.entries()].map(([id, name]) => ({
            name,
            isHost: id === gameRoom.host
          })),
          started: gameRoom.started
        });
      }
    }
  });

  socket.on("game:start_request", ({ room }) => {
    const gameRoom = rooms[room];
    if (!gameRoom) return;

    if (socket.id === gameRoom.host) {
      gameRoom.started = true;
      io.to(room).emit("game:start", {});
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});