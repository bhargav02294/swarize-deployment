// models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    otp: { type: String }, // Store OTP temporarily
    store: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Store' // Reference to the Store model
    },
    
    password: {
        type: String,
        required: function () {
          // Password is required only if the user did not sign up with OAuth
          return this.authMethod === 'email';
        },
      },
    authMethod: {
        type: String,
        enum: ['email', 'google'],
        required: true,
      },
    facebookId: { type: String }, // For Facebook users
    googleId: { type: String },   // For Google users
    country: { type: String, default: 'India' }, // Default country is India
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  
    phone: String,
    country: String,
    gender: String,
    birthdate: Date,


    streetAddress: String,
    city: String,
    district: String,
    state: String,
    zip: String,
});


// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

