require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./db");
const authRoutes = require("./auth");
const shopRoutes = require("./shop");
const { games, createPrivateGame, joinPrivateGame } = require("./game");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(shopRoutes);
app.use(express.static("../public"));

const server = http.createServer(app);
const io = new Server(server,{ cors:{ origin:"*" } });

io.on('connection', socket=>{
  socket.on('joinPrivateGame', ({ code, playerId })=>{
    try {
      const game = joinPrivateGame(code, playerId);
      socket.join(code);
      socket.to(code).emit('newPlayer', {id:playerId, pos:game.players[playerId]});
    } catch(err){ socket.emit('error', err.message);}
  });

  socket.on('playerMovement', ({code, playerId, pos})=>{
    if(games[code]){
      games[code].players[playerId]=pos;
      socket.to(code).emit('playerMoved',{id:playerId,pos});
    }
  });

  socket.on('lootCollected', ({code, lootId, playerId})=>{
    if(games[code]){
      games[code].loot = games[code].loot.filter(l=>l.id!==lootId);
      socket.to(code).emit('lootRemoved', lootId);
      games[code].players[playerId].score+=10;
    }
  });
});

const PORT = process.env.PORT || 3000;
connectDB().then(()=>server.listen(PORT,()=>console.log(`Server running on port ${PORT}`)));
