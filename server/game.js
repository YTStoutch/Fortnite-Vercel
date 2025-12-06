const games = {};

function generateGameCode(length=5){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code="";
  for(let i=0;i<length;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}

function createPrivateGame(hostId){
  const code = generateGameCode();
  games[code] = { players:{}, loot:[], status:'waiting', host: hostId };
  return code;
}

function joinPrivateGame(code, playerId){
  if(!games[code]) throw new Error("Partie introuvable");
  games[code].players[playerId] = { x:0, y:0, z:0, score:0 };
  return games[code];
}

module.exports = { games, createPrivateGame, joinPrivateGame };
