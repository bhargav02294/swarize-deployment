
const bcrypt = require('bcryptjs');
const session = require('express-session');

const MongoStore = require('connect-mongo');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();  // Load environment variables from .env file
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser"); 
const path = require('path');
const jwt = require("jsonwebtoken");
const cors = require("cors");
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator'); // For validation
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const crypto = require("crypto");

const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));


app.options('*', cors({
  origin: ["https://swarize.in"],
  credentials: true
}));
app.use(cors({
  origin: ["https://swarize.in"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// 🔄 Log every incoming route (for debugging loops/refreshes)
app.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});
app.set('view engine', 'ejs');
app.set('trust proxy', 1); // 🛡️ Add this line near the top (before session setup)




const User = require('./models/user');
const Store = require('./models/store');
const Product = require('./models/product');
const Cart = require("./models/cart");
const BankDetail = require("./models/BankDetail");
const Order = require("./models/order");
const Sale = require("./models/sale");
const PromoCode = require("./models/promoCode");
const Review = require("./models/review"); 

const sendEmail = require("./utils/sendEmail"); 



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});





// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error(" MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

// ✅ Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(passport.initialize());
app.use(passport.session());

// ✅ Debugging Middleware (Check Session Data)
app.use((req, res, next) => {
  console.log("🔹 Middleware - Session Data:", req.session);
  console.log("🔹 Middleware - Cookies:", req.cookies);
  next();
});


// ✅ TEST: Session Debugging Endpoint
app.get("/api/test-session", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No active session." });
  }
  res.json({ userId: req.session.userId, email: req.session.email });
});




const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(" Uploads directory created.");
}



// ✅ Import Routes
const authRoutes = require("./routes/authRoutes"); // ✅ Import the correct auth route
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const bankRoutes = require("./routes/bank");
const reviewRoutes = require("./routes/review");
const paymentRoutes = require("./routes/payment");
const storeRoutes = require('./routes/storeRoutes'); // Make sure this path is correct

// ✅ Use Routes
app.use("/api/auth", authRoutes);  
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);  
app.use("/api/bank", bankRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/api/store', storeRoutes);





// ✅ Authentication Middleware (Fix for Cart & Protected Routes)
// ✅ Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
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


// ✅ Debug Session Route (Check if Session is Working)
// ✅ Debug Session
app.get("/api/debug-session", (req, res) => {
  res.json({
    success: true,
    session: req.session,
    userId: req.session.userId || null,
    userName: req.session.userName || "Unknown"
  });
});

app.get("/verify-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "otp.html"));
});



app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});


function validateIndianUser(req, res, next) {
  if (req.user && req.user.country.toLowerCase() === 'india') {
    return next();
  }
  return res.status(403).json({ message: 'Access restricted to users in India.' });
}

app.use('/api/seller', validateIndianUser);
app.use('/api/admin', validateIndianUser);


// ✅ Get User ID from Session
// ✅ Get User ID from Session (Updated to fix login issues)
app.get("/api/user/session", async (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ success: true, userId: req.session.userId });
  }

  // 🛑 If session missing, try token recovery
  const token = req.cookies.token;
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.session.userId = verified.id;
      await req.session.save();
      console.log(" Session recovered from token!");
      return res.json({ success: true, userId: verified.id });
    } catch (err) {
      console.error(" Invalid token at /api/user/session");
      return res.status(401).json({ success: false, message: "Invalid session." });
    }
  }

  console.log(" No session or token found at /api/user/session");
  return res.status(401).json({ success: false, message: "User not logged in." });
});















// Sign-Up Route


// ✅ Sign-Up Route (Matches Updated `signup.js`)
// ✅ Sign-Up Route
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, country } = req.body;

  try {
      if (!country || country.toLowerCase() !== "india") {
          return res.status(400).json({ success: false, message: "This platform is only available for users in India." });
      }

      const existingUser = await User.findOne({ email: email.trim() });
      if (existingUser) {
          return res.status(409).json({ success: false, message: "User already exists." });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const newUser = new User({
          name,
          email: email.trim(),
          password: hashedPassword,
          country: country.toLowerCase(),
          authMethod: "email"
      });

      await newUser.save();

      // ✅ Fix: Set session after signup
      req.session.userId = newUser._id;
      req.session.userName = newUser.name;
      req.session.save(err => {
          if (err) {
              console.error(" Error saving session:", err);
              return res.status(500).json({ success: false, message: "Session save error." });
          }

          console.log(" User created and session started:", newUser);
          res.status(201).json({
              success: true,
              message: "User created successfully!",
              userId: newUser._id,
              redirect: "https://swarize.in/otp.html" // ✅ Redirect to OTP page
          });
      });

  } catch (error) {
      console.error(" Error during sign-up:", error);
      res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});






// ✅ Nodemailer Transporter Setup

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // ✅ Correct!
    pass: process.env.EMAIL_PASS   // ✅ Correct!
  }
});

// ✅ Verify transporter setup

transporter.verify((error, success) => {
  if (error) {
      console.error(" Email Transporter Error:", error);
  } else {
      console.log(" Email Transporter Ready!");
  }
});
let otpStorage = new Map(); // ✅ Use a Map object for proper storage


// ✅ API to Send OTP
// Generate & Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStorage.set(email, otp); // ✅ Now OTPs are stored correctly

  try {
      await sendEmail({
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
      });

      return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});




console.log(" Session Secret Loaded:", process.env.SESSION_SECRET ? "Secure" : "Not Set");
console.log(" MongoDB URI Loaded:", process.env.MONGO_URI ? "Secure" : "Not Set");
console.log(" Email Credentials Loaded:", process.env.EMAIL_USER ? "Secure" : "Not Set");









// API to verify email OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
        return res.status(400).send({ success: false, message: 'Email and OTP are required.' });
    }

    const storedOtp = otpStorage[email];

    if (!storedOtp) {
        return res.status(400).send({ success: false, message: 'OTP not found or expired. Please resend the OTP.' });
    }

    if (storedOtp === otp) {
      otpStorage.delete(email); // ✅ Remove OTP after successful verification
      res.send({ success: true, message: 'Email OTP verified successfully.' });
  }
  else {
        res.status(400).send({ success: false, message: 'Invalid OTP.' });
    }
});


// Route to reset password

// ✅ Reset Password API
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      const user = await User.findOne({ email: email.trim() });

      if (!user) {
          return res.status(404).json({ message: " User not found." });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
          return res.status(409).json({ message: " New password cannot be the same as the old password." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: " Password reset successfully!" });
  } catch (error) {
      console.error(" Error resetting password:", error);
      res.status(500).json({ message: " Failed to reset password. Please try again." });
  }
});






const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://swarize.in/auth/google/callback", // ✅ Must match Google Console
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
          user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              authMethod: "google"
          });
          await user.save();
      }

      req.session.userId = user._id;
      req.session.save();
      return done(null, user);
  } catch (error) {
      return done(error, null);
  }
}));






// ✅ Serialize & Deserialize User for Session Management
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      done(null, user);
  } catch (error) {
      done(error, null);
  }
});

// ✅ Google OAuth Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // ✅ Scope added
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
      res.redirect("https://swarize.in/dashboard"); // ✅ Redirects user to dashboard after login
  }
);

// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.logout(err => {
      if (err) {
          return res.status(500).send("Logout failed.");
      }
      req.session.destroy(() => {
          res.redirect("/");
      });
  });
});






// ✅ Sign-In Route (Matches Updated `signin.js`)
// ✅ Sign-In Route (Ensures `userId` is Saved in Session)
app.post("/api/auth/signin", async (req, res) => {
  console.log("🔹 Sign In Attempt:", req.body);
  
  try {
      const user = await User.findOne({ email: req.body.email.trim() });
      if (!user) {
          console.log(" User Not Found:", req.body.email);
          return res.status(400).json({ success: false, message: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
          console.log(" Invalid Password for:", req.body.email);
          return res.status(400).json({ success: false, message: "Invalid email or password." });
      }

      req.session.regenerate((err) => {
          if (err) return res.status(500).json({ success: false, message: "Session error." });

          req.session.userId = user._id;
          req.session.userName = user.name;

          // ✅ Force session save to prevent loss
          req.session.save((err) => {
              if (err) {
                  console.error(" Error saving session:", err);
                  return res.status(500).json({ success: false, message: "Session save error." });
              }

              console.log(" User Logged In:", { userId: req.session.userId, userName: req.session.userName });
              res.cookie("token", jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }), {
                  httpOnly: true,
                  secure: true,
                  sameSite: "None",
                  maxAge: 60 * 60 * 1000
              });

              res.json({ success: true, message: "Login successful!", userId: req.session.userId, userName: req.session.userName });
          });
      });

  } catch (error) {
      console.error(" Error during sign-in:", error);
      res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});




// ✅ Check if User is Logged In
app.get("/api/auth/is-logged-in", (req, res) => {
    console.log(" Checking if user is logged in...");
    console.log(" Session Data:", req.session);
    console.log(" Cookies:", req.cookies);

    if (req.session && req.session.userId) {
        return res.json({ isLoggedIn: true, userId: req.session.userId, userName: req.session.userName || "User" });
    }

    // 🛑 If session is missing, check JWT token and recover user
    const token = req.cookies.token;
    if (token) {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.session.userId = verified.id;
            req.session.save();
            return res.json({ isLoggedIn: true, userId: verified.id, userName: req.session.userName || "User" });
        } catch (err) {
            console.log(" Invalid or Expired Token.");
            return res.json({ isLoggedIn: false });
        }
    }

    return res.json({ isLoggedIn: false });
});




// Forgot Password Route
app.get('/forgot-password', (req, res) => {
  res.send('<h1>Forgot Password Page (Implementation Pending)</h1>');
});

// Profile Route (After Successful Login)
app.get("/profile", (req, res) => {
  if (req.session.userId) {
    res.redirect("https://swarize.in/index.html"); // ✅ Correct redirect
  } else {
    res.redirect("https://swarize.in/signin.html");
  }
});// ✅ Logout Route - Clears session and cookies
// ✅ Logout Route - Clears session and cookies
app.get("/api/auth/logout", (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(" Error destroying session:", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
      }

      console.log(" Session destroyed successfully");

      // ✅ Correctly clear cookies
      res.clearCookie("token", { path: "/", domain: "swarize.in", httpOnly: true, secure: true, sameSite: "None" });
      res.clearCookie("connect.sid", { path: "/", domain: "swarize.in", httpOnly: true, secure: true, sameSite: "None" });

      console.log(" Cookies cleared");

      // ✅ Redirect to homepage after logout
      return res.redirect("https://swarize.in");
  });
});









const { parsePhoneNumberFromString } = require('libphonenumber-js');

// Route to get user profile
app.get('/get-user-profile', async (req, res) => {
  console.log(`Session Data: ${JSON.stringify(req.session)}`); 

  const userId = req.session.userId || (req.user && req.user._id);
  
  if (!userId) {
    return res.status(401).json({ message: 'User not logged in.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      userName: user.name,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender || '',
      birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
      streetAddress: user.streetAddress || '',
      city: user.city || '',
      district: user.district || '',
      state: user.state || '',
      zip: user.zip || '',
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
});

// Route to update profile
app.post('/update-profile', async (req, res) => {
  console.log(`Session Data: ${JSON.stringify(req.session)}`);
  console.log(`User ID from session: ${req.session.userId}`);
  console.log(`User ID from Passport: ${req.user ? req.user._id : 'No user in req.user'}`);

  const userId = req.session.userId || (req.user && req.user._id);
  if (!userId) {
    return res.status(401).json({ message: 'User not logged in.' });
  }

  const { phone, gender, birthdate, streetAddress, city, district, state, zip } = req.body;

  // Validate the phone number based on Indian numbering plan
  const phoneNumber = parsePhoneNumberFromString(phone, 'IN'); 
  if (!phoneNumber || !phoneNumber.isValid()) {
    return res.status(400).json({ message: 'Invalid phone number for India.' });
  }

  try {
    // Find and update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phone, gender, birthdate, streetAddress, city, district, state, zip },
      { new: true }  
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// ✅ Route to Check if User Profile is Complete
app.get("/api/user/check-profile", async (req, res) => {
  try {
      const userId = req.session.userId || (req.user && req.user._id);
      if (!userId) {
          return res.status(401).json({ success: false, message: "User not logged in." });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      // ✅ Check Required Profile Fields
      if (!user.streetAddress || !user.city || !user.state || !user.zip || !user.phone) {
          return res.json({ success: false, message: "Profile incomplete. Please complete your profile." });
      }

      res.json({ success: true, message: "Profile is complete." });
  } catch (error) {
      console.error(" Error checking user profile:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});







// Add this middleware definition near the top of your file
const ensureSeller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
      return next();
  }
  res.status(403).json({ message: "Access denied. Seller account required." });
};

// Use it in your route
app.get("/api/sales/stats", ensureSeller, async (req, res) => {
  try {
      // Your existing logic for fetching sales stats
      const stats = await getSalesStats(req.user.id); // Example function
      res.json(stats);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching sales stats." });
  }
});

// Fetch sales statistics for the logged-in seller
app.get("/api/sales/stats", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please sign in first." });
  }

  try {
    const sales = await Sale.find({ sellerId: req.session.userId });

    const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);

    // Calculate profits based on your business logic
    const profitData = {
      lastDay: 0,
      last7Days: 0,
      last28Days: 0,
      total: totalSales,
    };

    const today = new Date();
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const twentyEightDaysAgo = new Date(today);
    twentyEightDaysAgo.setDate(today.getDate() - 28);

    sales.forEach(sale => {
      if (sale.date >= oneDayAgo) profitData.lastDay += sale.amount;
      if (sale.date >= sevenDaysAgo) profitData.last7Days += sale.amount;
      if (sale.date >= twentyEightDaysAgo) profitData.last28Days += sale.amount;
    });

    res.json({
      success: true,
      totalSales,
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales statistics.' });
  }
});

// Endpoint to fetch sales data for the seller
app.get("/api/seller-dashboard", async (req, res) => {
  try {
      const sellerId = req.user._id; // Assuming you're using session or token to get user ID
      const salesData = await Sales.find({ sellerId: sellerId }); // Adjust this line based on your sales model

      // Calculate total sales and profit, etc.
      const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
      const totalProfit = salesData.reduce((sum, sale) => sum + sale.profit, 0);
      // Further calculations for last day, last 7 days, and last 28 days...

      res.json({
          totalSales,
          totalProfit,
          // Add more fields as necessary
      });
  } catch (error) {
      console.error("Error fetching seller dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch sales data." });
  }
});

// In your server.js or relevant route file
// Check if user is logged in and has a store
app.get('/api/check-user-store-status', (req, res) => {
  if (req.isAuthenticated()) {
      const userId = req.user._id; // Assuming req.user contains user info

      // Check for the user's store
      Store.findOne({ ownerId: userId })
          .then(store => {
              res.json({
                  isLoggedIn: true,
                  hasStore: !!store, // Convert store object to boolean
              });
          })
          .catch(err => {
              console.error('Error finding store:', err);
              res.status(500).json({ isLoggedIn: true, hasStore: false });
          });
  } else {
      // User is not logged in
      res.json({ isLoggedIn: false, hasStore: false });
  }
});
app.get('/api/get-sales-data', async (req, res) => {
  // Implement logic to calculate sales data for the logged-in user
  const userId = req.user._id;
  // Example data (replace with actual calculation)
  res.json({
      salesLastDay: 100,
      salesLast7Days: 500,
      salesLast28Days: 2000,
      totalSales: 15000,
  });
});

app.get('/api/get-profit-data', async (req, res) => {
  // Implement logic to calculate profit data for the logged-in user
  const userId = req.user._id;
  // Example data (replace with actual calculation)
  res.json({
      profitLastDay: 50,
      profitLast7Days: 300,
      profitLast28Days: 1200,
      totalProfit: 8000,
  });
});

app.get('/api/get-product-performance', async (req, res) => {
  const userId = req.user._id;
  // Example data (replace with actual product performance query)
  const products = [
      { name: 'Product 1', unitsSold: 20, profit: 200 },
      { name: 'Product 2', unitsSold: 15, profit: 150 },
  ];
  res.json(products);
});




// ✅ Product Model

// ✅ Updated Categories and Subcategories (Sarees & Dresses Only)
const categoriesData = [
  {
    name: "Sarees",
    subcategories: [
      "Silk Saree",
      "Cotton Saree",
      "Georgette Saree",
      "Chiffon Saree",
      "Crepe Saree",
      "Linen Saree",
      "Banarasi Saree",
      "Kanjivaram Saree",
      "Paithani Saree",
      "Organza Saree",
      "Tissue Saree",
      "Satin Saree",
      "Net Saree",
      "Printed Saree",
      "Embroidered Saree"
    ]
  },
  {
    name: "Dresses",
    subcategories: [
      "Kurti",
      "Lehenga",
      "Anarkali Dress",
      "Gown",
      "Sharara",
      "Salwar Suit",
      "Palazzo Set",
      "Skirt Set",
      "Indo Western Dress",
      "Co-ord Set",
      "Churidar Set"
    ]
  }
];



// Endpoint to fetch categories
app.get('/api/categories', (req, res) => {
  const categories = categoriesData.map(category => ({
    name: category.name,
  }));
  res.json({ categories });
});

// Endpoint to fetch subcategories based on category
app.get('/api/subcategories', (req, res) => {
  const { category } = req.query;
  const foundCategory = categoriesData.find(cat => cat.name === category);
  if (foundCategory) {
    res.json({ subcategories: foundCategory.subcategories });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});



app.get("/api/products/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});


// Route to fetch products by category
app.get("/api/products/category/:category", async (req, res) => {
  try {
      const category = req.params.category;
      const products = await Product.find({ category: category });

      if (products.length === 0) {
          return res.status(200).json({ success: true, products: [] }); // ✅ Return empty array instead of 404
      }
      res.json({ success: true, products });
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});




app.get("/api/products", async (req, res) => {
  try {
      const products = await Product.find({});
      res.json({ success: true, products });
  } catch (error) {
      console.error(" Error fetching products:", error);
      res.status(500).json({ success: false, message: "Error fetching products" });
  }
});














// ✅ Check if User Has Bank Details
app.get("/api/bank/check", isAuthenticated, async (req, res) => {
  try {
      const bankDetails = await BankDetail.findOne({ userId: req.session.userId });
      if (bankDetails) {
          return res.json({ success: true });
      } else {
          return res.json({ success: false });
      }
  } catch (error) {
      console.error(" Error checking bank details:", error);
      res.status(500).json({ success: false, message: "Error checking bank details." });
  }
});








app.post("/api/payment/create-order", async (req, res) => {
  console.log(" Payment route is loaded."); // This must appear in terminal

  try {
      let { amount } = req.body;

      if (!amount || amount < 1) {
          console.error(" Invalid amount:", amount);
          return res.status(400).json({ success: false, message: "Minimum order amount must be at least ₹1" });
      }

      amount = amount * 100; // Convert to paisa

      const order = await razorpay.orders.create({
          amount: amount,
          currency: "INR",
          payment_capture: 1 
      });

      console.log(" Razorpay Order Created:", order);
      res.json({ success: true, orderId: order.id, amount: order.amount });

  } catch (error) {
      console.error(" Razorpay Order Error:", error);
      res.status(500).json({ success: false, message: "Payment order creation failed." });
  }
});




app.post("/api/orders/create", async (req, res) => {
  try {
    const { productId, buyerId, paymentId, promoCode, selectedSize } = req.body;  
    console.log("🔹 Order API Called:", { productId, buyerId, paymentId, promoCode, selectedSize });

      // ✅ Fetch Buyer, Seller, and Product Details
      const buyer = await User.findById(buyerId);
      const product = await Product.findById(productId).populate("ownerId");
      const seller = product ? product.ownerId : null;
      const store = seller ? await Store.findOne({ ownerId: seller._id }) : null;
      const buyerBank = await BankDetail.findOne({ userId: buyerId });
      let sellerBank = seller ? await BankDetail.findOne({ userId: seller._id }).lean() : null;

      const sizeToSave = selectedSize && selectedSize.trim() !== "" ? selectedSize : "Not selected";


      console.log(" Seller Bank Found:", sellerBank);
      console.log(" Buyer:", buyer);
      console.log(" Product:", product);
      console.log(" Seller:", seller);
      console.log(" Store:", store);
      console.log(" Buyer Bank:", buyerBank);

      
      // ✅ Check if any required data is missing
      if (!buyer || !product || !seller || !buyerBank) {
          console.log(" Invalid transaction details: Some data is missing");
          return res.status(400).json({ success: false, message: "❌ Invalid transaction details." });
      }

      if (!sellerBank) {
        console.warn(" Warning: Seller Bank details missing. Proceeding with default values...");
        sellerBank = {
            bankName: "Not Provided",
            accountHolder: "Not Provided",
            accountNumber: "0000000000",
            ifscCode: "XXXX0000000"
        };
      }

      //  Validate store before saving anything
      if (!store) {
          console.error(" Error: Seller's store not found!");
          return res.status(400).json({ success: false, message: "Seller's store not found." });
      }

      // ✅ Store Order in Database
      const newOrder = new Order({
          productId,
          productName: product.name,
          productPrice: product.price,
                displayPrice: product.displayPrice || 0, // ✅ New: crossed-out MRP

          thumbnailImage: product.thumbnailImage,
          category: product.category,
          subcategory: product.subcategory,
          selectedSize: sizeToSave,
          buyerId: buyer._id,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerAddress: {
              streetAddress: buyer.streetAddress || "",
              city: buyer.city || "",
              district: buyer.district || "",
              state: buyer.state || "",
              zip: buyer.zip || "",
              phone: buyer.phone || "",
              country: buyer.country || "India",
          },
          buyerBankDetails: {
              bankName: buyerBank.bankName,
              accountHolder: buyerBank.accountHolder,
              accountNumber: buyerBank.accountNumber,
              ifscCode: buyerBank.ifscCode,
          },
          sellerId: seller._id,
          sellerName: seller.name,
          sellerEmail: seller.email,
          sellerStoreName: store.storeName || "Unknown",
          sellerBankDetails: {
              bankName: sellerBank.bankName || "Not Provided",
              accountHolder: sellerBank.accountHolder || "Not Provided",
              accountNumber: sellerBank.accountNumber || "0000000000",
              ifscCode: sellerBank.ifscCode || "XXXX0000000",
          },
          paymentId,
          paymentStatus: "Completed",
          orderStatus: "Processing",
      });

      await newOrder.save();

      // ✅ Store Sale in Database (for Seller Dashboard)
      const newSale = new Sale({
          productId,
          productName: product.name,
          productPrice: product.price,
                displayPrice: product.displayPrice || 0, // ✅ New: crossed-out MRP

          thumbnailImage: product.thumbnailImage,
          category: product.category,
          subcategory: product.subcategory,
          selectedSize: sizeToSave,
          sellerId: seller._id,
          sellerName: seller.name,
          sellerEmail: seller.email,
          sellerStoreName: store.storeName || "Unknown",
          sellerBankDetails: {
              bankName: sellerBank.bankName || "Not Provided",
              accountHolder: sellerBank.accountHolder || "Not Provided",
              accountNumber: sellerBank.accountNumber || "0000000000",
              ifscCode: sellerBank.ifscCode || "XXXX0000000",
          },
          paymentId,
          paymentStatus: "Completed",
          orderStatus: "Processing",
          sellerEarnings: product.sellerEarnings || 0, // ✅ Directly save sellerEarnings if available

      });

      console.log(" Sale Data Being Saved:", newSale);
      await newSale.save();

      console.log(" Order & Sale Recorded Successfully!");

       // ✅ Check and Mark Promo Code as Used if Applied
      if (promoCode) { 
        const expiredPromo = await PromoCode.findOneAndUpdate(
            { userId: buyerId, code: promoCode, isUsed: false },
            { isUsed: true },
            { new: true }
        );

        if (expiredPromo) {
            console.log(" Promo Code Expired:", expiredPromo.code);
        } else {
            console.warn(" Promo Code was already used or not found.");
        }
    }

    // ✅ Generate and Send New Promo Code for the Next Purchase
    let existingPromo = await PromoCode.findOne({ userId: buyer._id, isUsed: false });

    if (!existingPromo) {
        const newPromoCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newPromo = new PromoCode({
            userId: buyer._id,
            email: buyer.email,
            code: newPromoCode,
            discount: 5,
            isUsed: false,
        });

        await newPromo.save();

        // ✅ Send promo code via email
        const subject = "🎉 Your Exclusive Promo Code!";
        const message = `Hello ${buyer.name}, your promo code is: ${newPromoCode}. Use it for a 5% discount on your next purchase!`;

        await sendEmail(buyer.email, subject, message);
        console.log(" Promo Code Sent Successfully to:", buyer.email);
    } else {
        console.log("Existing promo code found:", existingPromo.code);
    }

    res.json({ success: true, message: " Order & Promo Code Sent Successfully!" });


  } catch (error) {
      console.error(" Error saving order:", error);
      res.status(500).json({ success: false, message: " Failed to save order." });
  }
});







// ✅ Fetch orders for a logged-in buyer
// ✅ Fetch orders for a logged-in buyer
app.get("/api/orders/buyer", async (req, res) => {
  try {
      const buyerId = req.session.userId;
      if (!buyerId) {
          console.log(" No buyerId found in session");
          return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });

      if (!orders.length) {
          return res.json({ success: true, orders: [] });
      }

      res.json({ success: true, orders });
  } catch (error) {
      console.error(" Error fetching buyer orders:", error);
      res.status(500).json({ success: false, message: "Server error!" });
  }
});



// ✅ Fetch sales for a logged-in seller
// ✅ Fetch sales for a logged-in seller
app.get("/api/orders/seller", async (req, res) => {
  try {
    const sellerId = req.session.userId;
    if (!sellerId) {
      console.log(" No sellerId found in session");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log(" Fetching Sales for Seller ID:", sellerId);
    const sales = await Sale.find({ sellerId }).sort({ createdAt: -1 });

    if (!sales.length) {
      return res.json({ success: true, sales: [], summary: {
        totalProducts: 0,
        totalPrice: 0,
        totalEarnings: 0,
      }});
    }

    // 🔢 Calculate Summary
    const totalProducts = sales.length;
    const totalPrice = sales.reduce((sum, sale) => sum + (sale.productPrice || 0), 0);
    const totalEarnings = sales.reduce((sum, sale) => sum + (sale.sellerEarnings || 0), 0);

    res.json({
      success: true,
      sales,
      summary: {
        totalProducts,
        totalPrice,
        totalEarnings,
      }
    });
  } catch (error) {
    console.error(" Error fetching seller sales:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});






app.post("/api/promocode/apply", async (req, res) => {
  try {
      const { userId, promoCode, productPrice } = req.body;

      if (!userId || !promoCode || !productPrice) {
          return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // ✅ Check if the promo code exists and is valid
      const promo = await PromoCode.findOne({ userId, code: promoCode, isUsed: false });

      if (!promo) {
          return res.status(400).json({ success: false, message: "Invalid or expired promo code." });
      }

      // ✅ Apply 5% discount
      const discount = productPrice * 0.05;
      const finalAmount = (productPrice - discount).toFixed(2);

      res.json({ success: true, discount, finalAmount, message: "Promo code applied successfully!" });

  } catch (error) {
      console.error(" Error applying promo code:", error);
      res.status(500).json({ success: false, message: "Server error." });
  }
});






app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
  }

  let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
      },
  });

  let mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, 
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: "Message sent successfully!" }); // Ensure success response
  } catch (error) {
      console.error("Email error:", error);
      return res.status(500).json({ error: "Error sending message." });
  }
});







const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
})