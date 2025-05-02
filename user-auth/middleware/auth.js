const jwt = require("jsonwebtoken");

// ✅ Middleware: Checks session or token and attaches user to req
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.user = { id: req.session.userId };
        return next();
    }

    const token = req.cookies.token;
    if (token) {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            if (!req.session.userId) {
                req.session.userId = verified.id;
                req.session.save();
            }

            return next();
        } catch (err) {
            return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
        }
    }

    return res.status(401).json({ success: false, message: "Unauthorized: Please log in." });
};

// ✅ Middleware: Only verifies JWT and adds `req.user`
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { isAuthenticated, authenticateToken };
