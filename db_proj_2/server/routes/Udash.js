const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const [listOfDonations, metadata] = await db.sequelize.query(
    "SELECT * FROM Donations;"
  );
  res.json(listOfDonations);
});

router.get("/byUser/:username", async (req, res) => {
  console.log("HERE");
  const username = req.params.username;
  const post = await Donations.findByPk(username);
  res.json(post);
});

router.post("/", async (req, res) => {
  const post = req.body;
  await Donations.create(post);
  res.json(post);
});

module.exports = router;
