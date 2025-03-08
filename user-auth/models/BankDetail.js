const mongoose = require("mongoose");

const BankDetailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankName: { type: String, required: true },
  accountHolder: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  ifscCode: { type: String, required: true },
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("BankDetail", BankDetailSchema);
