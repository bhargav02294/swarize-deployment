/*
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
*/






const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 249,
  },

  description: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
    default: "",
  },

  category: {
    type: String,
    required: true,
  },

  subcategory: {
    type: String,
    required: true,
  },

  size: {
    type: String,
    default: "",
  },

  color: {
    type: String,
    default: "",
  },

  material: {
    type: String,
    default: "",
  },

  pattern: {
    type: String,
    default: "",
  },

  washCare: {
    type: String,
    default: "",
  },

  modelStyle: {
    type: String,
    default: "",
  },

  brand: {
    type: String,
    default: "",
  },

  availableIn: {
    type: String,
    default: "All Over India",
  },

  thumbnailImage: {
    type: String,
    required: true,
  },

  extraImages: {
    type: [String],
    default: [],
  },

  extraVideos: {
    type: [String],
    default: [],
  },

  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
