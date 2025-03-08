const bcrypt = require('bcryptjs');

// Replace with the password you want to test
const password = 'raj@123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed Password:', hash);
    }
});
