const express = require('express');
const router = express.Router();

// Replace with your session logic
router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      userId: req.session.user._id,
      email: req.session.user.email
    });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

module.exports = router;
