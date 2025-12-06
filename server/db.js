const { MongoClient } = require("mongodb");
require("dotenv").config(); // Charge les variables depuis .env

const uri = process.env.DB_URI;

if (!uri) {
  throw new Error(
    "❌ Erreur : DB_URI n'est pas défini ! Ajoute cette variable dans Render ou dans un fichier .env"
  );
}

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  if (db) return db; // Si déjà connecté, retourne la connexion existante
  try {
    await client.connect();
    db = client.db("mini-fortnite");
    console.log("✅ Connecté à MongoDB");
    return db;
  } catch (err) {
    console.error("❌ Impossible de se connecter à MongoDB :", err);
    process.exit(1); // Quitte le serveur si connexion impossible
  }
}

function getDB() {
  if (!db) {
    throw new Error("❌ DB non initialisée. Appelle d'abord connectDB()");
  }
  return db;
}

module.exports = { connectDB, getDB };
