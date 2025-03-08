// models/store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  ownerEmail: { type: String, required: true },
  storeName: { type: String, required: true, unique: true },
  storeLogo: { type: String, required: true },
  description: { type: String, default: "" }, // Store description
  country: { type: String, required: true, default: "India" },
  authMethod: { type: String, enum: ['email', 'google', 'facebook'], default: 'email' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
