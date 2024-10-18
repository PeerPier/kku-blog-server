const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },

    message: { type: String, required: true },
    entity: { type: mongoose.Schema.Types.ObjectId, refPath: "entityModel" },
    entityModel: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { type: Date, default: Date.now } }
);

module.exports = mongoose.model("Notification", notificationSchema);
