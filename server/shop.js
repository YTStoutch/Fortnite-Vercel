const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

const skins = [
  { id:'skin1', name:'Red Ninja', price:100, model:'red_ninja.glb' },
  { id:'skin2', name:'Blue Ranger', price:150, model:'blue_ranger.glb' }
];

router.get("/skins", (req,res)=> res.json(skins));

// Acheter skin
router.post("/buySkin", async (req,res)=>{
  const { userId, skinId } = req.body;
  const db = getDB();
  const user = await db.collection("users").findOne({ _id: userId });
  if(!user) return res.status(404).json({error:"User not found"});
  // ajouter logique prix
  await db.collection("users").updateOne({_id:userId},{$addToSet:{skinsOwned:skinId}});
  res.json({success:true});
});

module.exports = router;
