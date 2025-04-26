const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
