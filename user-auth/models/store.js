const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ownerEmail: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },  // Store the logo URL or path
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
