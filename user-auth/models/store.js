const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  storeName: { type: String, required: true },
  storeLogo: { type: String, required: true },
  description: { type: String, required: true }
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
