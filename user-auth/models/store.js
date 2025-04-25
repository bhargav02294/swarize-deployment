const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: String,
  bannerUrl: String,
  description: String,
  socialLinks: {
    instagram: String,
    whatsapp: String,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Store', storeSchema);
