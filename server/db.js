const { MongoClient } = require("mongodb");
const uri = process.env.DB_URI;

const client = new MongoClient(uri);
let db;

async function connectDB(){
  await client.connect();
  db = client.db("mini-fortnite");
  console.log("Connected to MongoDB");
}

function getDB(){ return db; }

module.exports = { connectDB, getDB };
