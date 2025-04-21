const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
