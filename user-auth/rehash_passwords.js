const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB

mongoose.connect('mongodb://bharg:bh00mi2294@localhost:27017/sahya?authSource=admin')
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => console.error('MongoDB connection error:', error));

    

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    authMethod: String
}));

// A dictionary of emails and their original plaintext passwords
// Replace these with the correct original passwords for each user
const userPasswords = {
    "raja@mail.com": "raja@123",
    "raj@mail.com": "raj@123",
    "baban@mail.com": "baban@123",
    "raja@mail.comm": "rajaa@123",
    "raja@mail.co": "raja@12",
    "we@mail.com": "we@123",  // Example correct password
    "ahire@mail.com": "ahire@123",  // Example correct password
    "up@mail.com": "up@123",
    "tata@mail.com": "tata@123"

};

(async () => {
    try {
        const users = await User.find({ authMethod: 'email' });

        for (let user of users) {
            // Get the original plaintext password for this user
            const originalPassword = userPasswords[user.email];

            if (originalPassword) {
                console.log(`Rehashing password for user: ${user.email}`);

                // Generate a new hash for the user’s original plaintext password
                const newHashedPassword = await bcrypt.hash(originalPassword, 10);

                // Update the user's password in the database
                user.password = newHashedPassword;
                await user.save();

                console.log(`Password updated for: ${user.email}`);
            } else {
                console.log(`No original password available for user: ${user.email}`);
            }
        }

        console.log('All passwords rehashed successfully.');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error rehashing passwords:', error);
    }
})();
