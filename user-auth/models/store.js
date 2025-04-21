// models/store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
