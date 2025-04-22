const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ownerEmail: { type: String },
  storeName: { type: String, required: true },
  storeLogo: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Store", storeSchema);
