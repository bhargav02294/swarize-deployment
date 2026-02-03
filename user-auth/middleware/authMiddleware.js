const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  // ✅ 1. Session check first (fastest)
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  }

  // ✅ 2. Fallback to JWT token
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // restore session from token
    req.session.userId = decoded.id;
    req.user = decoded;

    req.session.save(() => next());
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }
};

module.exports = { isAuthenticated };
