const mongoose = require('mongoose');
const slugify = require('slugify');

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  logoUrl: { type: String, required: true },
  slug: { type: String, unique: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

storeSchema.pre('save', function (next) {
  if (this.isModified('storeName')) {
    this.slug = slugify(this.storeName, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);
