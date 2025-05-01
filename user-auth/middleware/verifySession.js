// middlewares/verifySession.js
module.exports = function (req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
  
    // Also check for token in cookies (JWT fallback)
    const token = req.cookies?.token;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.session.userId = decoded.id;
        return next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  
    return res.status(401).json({ message: "Unauthorized" });
  };
  