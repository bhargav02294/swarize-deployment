const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discount: { type: Number, default: 5 }, // 5% discount
    isUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PromoCode", promoCodeSchema);
