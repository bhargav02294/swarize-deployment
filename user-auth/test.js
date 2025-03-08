const bcrypt = require('bcryptjs');

// Replace with the user's actual password and hash from MongoDB
const plaintextPassword = 'jio@123';
const storedHash = '$2a$10$khuuo.BFDX3C86t8b02IputKOyw2ubJ0tqIV61RMaFAHaOrkc9FYW';  // Replace with hash from the database

bcrypt.compare(plaintextPassword, storedHash, (err, isMatch) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else {
        console.log('Password Match:', isMatch);  // Should print 'true' if correct
    }
});
