const { MongoClient } = require("mongodb");

// Ton URI complet ici
const uri = "mongodb+srv://jeux56330_db_user:<db_password>@cluster0.sotyk5g.mongodb.net/mini-fortnite?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("mini-fortnite");
    console.log("✅ Connecté à MongoDB");
    return db;
  } catch (err) {
    console.error("❌ Impossible de se connecter à MongoDB :", err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error("❌ DB non initialisée. Appelle d'abord connectDB()");
  }
  return db;
}

module.exports = { connectDB, getDB };
