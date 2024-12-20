// Server-side (app.js)
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.static('public'));

let broadcaster;

io.on('connection', socket => {
    console.log('Socket connected:', socket.id);

    socket.on('broadcaster', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcaster');
        console.log('Broadcaster ready:', broadcaster);
    });

    socket.on('watcher', () => {
        if (broadcaster) {
            socket.to(broadcaster).emit('watcher', socket.id);
            console.log('Watcher ready:', socket.id);
        }
    });

    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
        console.log('Offer sent to:', id);
    });

    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
        console.log('Answer sent to:', id);
    });

    socket.on('candidate', (id, message) => {
        socket.to(id).emit('candidate', socket.id, message);
    });

    socket.on('disconnect', () => {
        if (socket.id === broadcaster) {
            broadcaster = null;
            socket.broadcast.emit('disconnectPeer');
            console.log('Broadcaster disconnected');
        }
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));