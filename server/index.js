const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Servir les fichiers client
app.use(express.static('public'));

let players = {};
let lootItems = [
  { id: 'loot1', x: 0, z: 0 },
  { id: 'loot2', x: 2, z: 2 },
  { id: 'loot3', x: -2, z: -2 }
];

io.on('connection', socket => {
  console.log('Player connected: ' + socket.id);
  players[socket.id] = { x:0, y:0, z:0 };

  // Envoyer les autres joueurs et le loot au nouveau joueur
  socket.emit('currentPlayers', players);
  socket.emit('currentLoot', lootItems);

  socket.broadcast.emit('newPlayer', {id: socket.id, pos: players[socket.id]});

  socket.on('playerMovement', pos => {
    players[socket.id] = pos;
    socket.broadcast.emit('playerMoved', {id: socket.id, pos});
  });

  socket.on('lootCollected', lootId => {
    lootItems = lootItems.filter(l => l.id !== lootId);
    io.emit('lootRemoved', lootId);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
