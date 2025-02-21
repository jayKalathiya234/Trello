const { Server } = require("socket.io");

const users = {};
const conectChat = () => {
    const io = new Server({
        cors: {
            origin: "*"
        }
    });

    const users = {};

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("register", (userId) => {
            users[userId] = socket.id;
            console.log(`User ${userId} registered with socket ${socket.id}`);

            io.emit("users-list", Object.keys(users));
        });

        socket.on("join-room", (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on("message", ({ data, room }) => {
            console.log(`Sending message to room: ${room}`);
            io.to(room).emit("rec-msg", data);
        });

        socket.on("disconnect", () => {
            const userId = Object.keys(users).find((key) => users[key] === socket.id);
            if (userId) {
                delete users[userId];
                console.log(`User ${userId} disconnected`);
                io.emit("users-list", Object.keys(users));
            }
        });
    });

    io.listen(5000);
};

module.exports = conectChat;
