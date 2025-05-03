const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }, // Ensure link to Store
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    summary: { type: String },
    category: { type: String },
    subcategory: { type: String },
    tags: [{ type: String }],
    size: { type: String },
    color: { type: String },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },

    material: { type: String },
    modelStyle: { type: String },
    availableIn: { type: String, default: 'All Over India' },
    thumbnailImage: { type: String },
    extraImages: [{ type: String }],
    extraVideos: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
