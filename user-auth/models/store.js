const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  storeLogo: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
