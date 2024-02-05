// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));

const users = {}; // Keep track of users and their respective rooms

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (username, room) => {
        socket.join(room);
        users[socket.id] = { username, room };
        io.to(room).emit('chat message', `${username} joined the chat`);
        io.to(room).emit('users', getUsersInRoom(room));
    });

    socket.on('chat message', (msg) => {
        const user = users[socket.id];
        io.to(user.room).emit('chat message', { user: user.username, message: msg });
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit('chat message', `${user.username} left the chat`);
            delete users[socket.id];
            io.to(user.room).emit('users', getUsersInRoom(user.room));
        }
        console.log('User disconnected');
    });
});

function getUsersInRoom(room) {
    return Object.values(users).filter(user => user.room === room).map(user => user.username);
}

server.listen(3000, () => {
    console.log('Server listening on *:3000');
});
