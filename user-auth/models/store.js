const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  ownerEmail: { type: String, required: true },
  storeName: { type: String, required: true, unique: true },
  storeLogo: { type: String, required: true },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
