const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  storeName: { type: String, required: true },
  storeLogo: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Store", storeSchema);
