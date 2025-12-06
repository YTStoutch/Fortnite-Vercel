const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDB } = require("./db");

router.use(express.json());

// Inscription
router.post("/signup", async (req,res)=>{
  const db = getDB();
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password,10);
  const result = await db.collection("users").insertOne({ username, password:hashed, score:0, skinsOwned:[], equippedSkin:null });
  const token = jwt.sign({ id: result.insertedId, username }, process.env.JWT_SECRET);
  res.json({ token });
});

// Connexion
router.post("/login", async (req,res)=>{
  const db = getDB();
  const { username, password } = req.body;
  const user = await db.collection("users").findOne({ username });
  if(!user) return res.status(404).json({error:"User not found"});
  const valid = await bcrypt.compare(password,user.password);
  if(!valid) return res.status(401).json({error:"Invalid password"});
  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
