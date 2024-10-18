const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ message: "Query parameter is missing or not a string" });
  }

  try {
    const users = await User.find({
      $or: [
        { firstname: new RegExp(query, "i") },
        { lastname: new RegExp(query, "i") },
        { username: new RegExp(query, "i") },
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/find/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-profile", (req, res) => {
  let { username } = req.body;
  console.log(req.body);

  User.findOne({ username: username })
    .select("-password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

module.exports = router;
