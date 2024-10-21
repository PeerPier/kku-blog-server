const express = require("express");
const messageModel = require("../models/message");
const router = express.Router();

router.post("/", async (req, res) => {
  const { chatId, senderId, text } = req.body;

  const message = new messageModel({
    chatId,
    senderId,
    text,
    createdAt: new Date(),
  });

  try {
    const response = await message.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/:chatId", async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/delete", async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    // Update messages to mark as deleted for the specific user
    const result = await messageModel.updateMany(
      { chatId: chatId },
      { $set: { [`deletedBy.${userId}`]: true } }
    );

    res.status(200).json({ message: "Messages marked as deleted", result });
  } catch (error) {
    console.error("Error in /delete route:", error); // Log the full error message
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
