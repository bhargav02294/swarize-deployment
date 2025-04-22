const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  storeName: {
    type: String,
    required: true
  },
  storeLogo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Store", storeSchema);
