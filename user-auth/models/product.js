const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnailImage: { type: String, required: true },
    extraImages: { type: [String] },  
    extraVideos: { type: [String] }, 
    description: { type: String, required: true },
    summary: { type: String },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    tags: { type: [String], required: true },
    size: { type: String },
    color: { type: String },
    material: { type: String },
    modelStyle: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerEarnings: { type: Number, required: false },
    availableIn: { type: String, default: "All Over India" }, // ✅ Added this field
    // Default to all states

});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
