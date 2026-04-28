const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    x: Math.random() * 600 + 100,
    y: Math.random() * 300 + 100,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`
  };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('update', (data) => {
    players[socket.id] = { ...players[socket.id], ...data };
    socket.broadcast.emit('playerMoved', { id: socket.id, ...players[socket.id] });
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor rodando na porta', PORT));