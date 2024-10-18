const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Route URL to get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// Route URL to get user data by ID
router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.post("/edit-profile/update/:id", async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  if (req.file) {
    userData.profile_picture = req.file.path;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Internal server error");
  }
});

// Add this route in your existing user routes file
router.post("/edit-profile/notifications/:id", async (req, res) => {
  const userId = req.params.id;
  const { show_notifications } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { show_notifications },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating notification setting:", error);
    res.status(500).send("Internal server error");
  }
});

// Route URL to delete user profile by ID
router.delete("/edit-profile/delete/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

router.post("/changepassword/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Error updating password" });
  }
});

module.exports = router;
