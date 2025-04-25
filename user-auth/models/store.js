const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
