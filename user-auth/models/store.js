const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerEmail: { type: String, required: true },
  storeName: { type: String, required: true },
  storeLogo: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
