

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

  // ✅ Display (MRP) price – just for showing line-through
  displayPrice: {
    type: Number,
    default: 0,
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
      enum: ["Sarees", "Dresses"], // Main categories
    },

  subcategory: {
    type: String,
    required: true,
  },

  // ✅ Product Code (instead of brand)
    productCode: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ Sizes (array of multiple checkboxes)
    size: {
      type: [String],
      default: [],
    },

    // ✅ Saree-specific Fields
    sareeLength: {
      type: Number, // meters
      default: null,
    },
    blouseLength: {
      type: Number, // meters
      default: null,
    },

    // ✅ Common Product Details
    color: {
      type: String,
      trim: true,
      default: "",
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    pattern: {
      type: String,
      trim: true,
      default: "",
    },

    occasion: {
      type: String,
      trim: true,
      default: "",
    },

    washCare: {
      type: String,
      trim: true,
      default: "",
    },

    modelStyle: {
      type: String,
      trim: true,
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
