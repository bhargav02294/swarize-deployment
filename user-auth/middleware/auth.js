const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    console.log("🔍 Checking authentication...");
    console.log("🔹 Session Data:", req.session);
    console.log("🔹 Cookies:", req.cookies);

    // ✅ Check if user ID exists in the session
    if (req.session && req.session.userId) {
        req.user = { id: req.session.userId };
        console.log("✅ User Verified via Session:", req.user);
        return next();
    }

    // ✅ Check for JWT token in cookies
    const token = req.cookies.token;
    console.log("🔹 Token received:", token);

    if (token) {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            console.log("✅ User Verified via Token:", req.user);

            // ✅ Ensure `userId` is set in session if not already
            if (!req.session.userId) {
                req.session.userId = verified.id;
                req.session.save();
                                console.log("✅ Session userId set:", req.session.userId);
            }
            return next();
        } catch (err) {
            console.log("❌ Invalid or Expired Token.");
            return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
        }
    }

    console.log("❌ No valid authentication found.");
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in." });
};

module.exports = { isAuthenticated };
