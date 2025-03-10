
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const express = require('express');

const nodemailer = require('nodemailer');

require('dotenv').config();  // Load environment variables from .env file


const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const cookieParser = require("cookie-parser"); 
app.use(cookieParser()); // ✅ Ensure cookie-parser is used

const path = require('path');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const cors = require("cors");
app.use(cors({
  origin: ["https://www.swarize.in"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const subscribers = []; // Temporary storage (use database in production)

const { isAuthenticated } = require("./middleware/auth");

const User = require('./models/user');
const Store = require('./models/store');
const Product = require('./models/product');
const Cart = require("./models/cart");
const BankDetail = require("./models/BankDetail");
const Order = require("./models/order");
const Sale = require("./models/sale");
const PromoCode = require("./models/promoCode");
const Review = require("./models/review"); // Import the Review model
const sendEmail = require("./utils/sendEmail"); // Utility function for sending emails

const fs = require('fs');
const router = express.Router();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/product'); // Import your product routes
const cartRoutes = require('./routes/cart'); // Import your product routes
const bankRoutes = require("./routes/bank");
const reviewRoutes = require("./routes/review");

const flash = require('connect-flash');
const { check, validationResult } = require('express-validator'); // For validation

const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const Razorpay = require("razorpay");

const EMAIL_OTP = {}; // To store email OTP temporarily
const PHONE_OTP = {}; // To store phone OTP temporarily


const axios = require('axios');

// Enable CORS for all routes
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Serve static files like index.html from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URI = process.env.MONGO_URI;



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      autoRemove: 'native'
  }),
  cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ Secure in production
      sameSite: "None", // ✅ Fixes cross-origin issues
      maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));


app.use(passport.initialize());
app.use(passport.session());
console.log("✅ Environment Variables:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

app.use("/api/payment", require("./routes/payment"));
app.use("/api/reviews", reviewRoutes);

app.use('/cart', require('./routes/cart'));
app.use("/api/bank", bankRoutes);

app.use(flash());
app.use('/auth', authRoutes);
app.use("/api/products", require("./routes/product"));
// Set view engine to EJS
app.set('view engine', 'ejs');
// Display the sign-in page

const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          tls: true,
          tlsAllowInvalidCertificates: true
      });
      console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1);
  }
};
connectDB();

app.get('/debug-session', (req, res) => {
  res.json({ session: req.session });
});


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log("🔹 Checking Authentication - Session Data:", req.session);

  if (!req.session || (!req.session.userId && !req.session.passport?.user)) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
  }

  req.session.regenerate((err) => {
      if (err) {
          console.error("Error regenerating session:", err);
          return res.status(500).json({ success: false, message: "Session error" });
      }

      req.session.userId = req.session.userId || req.session.passport?.user;
      
      req.session.save((err) => {
          if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ success: false, message: "Session save error" });
          }
          next();
      });
  });
};






app.use((req, res, next) => {
  console.log("🔹 Middleware - Session Data:", req.session);
  next();
});


app.get('/store', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'store.html'));
});

// Sign-in route
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});
// Root route (serves index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function validateIndianUser(req, res, next) {
  if (req.user && req.user.country.toLowerCase() === 'india') {
    return next();
  }
  return res.status(403).json({ message: 'Access restricted to users in India.' });
}

// Apply middleware to seller and admin routes
app.use('/api/seller', validateIndianUser);
app.use('/api/admin', validateIndianUser);

// ✅ Fetch user session (Returns user ID)
app.get("/api/user/session", async (req, res) => {
  if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "User not logged in." });
  }

  res.json({ success: true, userId: req.session.userId });
});

console.log("🔹 Session Debug - Headers:", req.headers);
console.log("🔹 Session Debug - Cookies:", req.cookies);
console.log("🔹 Session Debug - Raw Session Data:", req.session);



app.get("/api/debug-session", (req, res) => {
  console.log("🐛 Debugging Session Data:", req.session);
  
  if (!req.session) {
      return res.status(500).json({ success: false, message: "Session not found!" });
  }

  res.json({
      success: true,
      sessionID: req.sessionID,
      sessionData: req.session
  });
});








// Sign-Up Route


// ✅ Sign-Up Route (Matches Updated `signup.js`)
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, country } = req.body;

  try {
      if (!country || country.toLowerCase() !== "india") {
          return res.status(400).json({ message: "This platform is only available for users in India." });
      }

      const existingUser = await User.findOne({ email: email.trim() });
      if (existingUser) {
          return res.status(409).json({ message: "User already exists." });
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
      res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
      console.error("❌ Error during sign-up:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});


// ✅ Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: EMAIL_USER,  // ✅ Uses hardcoded credentials
      pass: EMAIL_PASS
  }
});
// ✅ Verify transporter setup

transporter.verify((error, success) => {
  if (error) {
      console.error("❌ Email Transporter Error:", error);
  } else {
      console.log("✅ Email Transporter Ready!");
  }
});
let otpStorage = {}; // ✅ Temporary storage for OTPs


// ✅ API to Send OTP
app.post('/api/send-otp', async (req, res) => {
  console.log("📩 OTP Request Received:", req.body);

  const { email } = req.body;
  if (!email) {
      console.log("❌ ERROR: No email provided!");
      return res.status(400).send({ success: false, message: "Email is required!" });
  }

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = otp;
  console.log("🔹 Generated OTP:", otp);

  try {
      let info = await transporter.sendMail({
          from: EMAIL_USER,
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is ${otp}.`
      });

      console.log("✅ OTP Email Sent Successfully:", info.response);
      res.send({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
      console.error("❌ OTP Email Error:", error);
      res.status(500).send({ success: false, message: 'Failed to send OTP.', error: error.message });
  }
});




console.log("✅ Session Secret Loaded:", process.env.SESSION_SECRET ? "Secure" : "Not Set");
console.log("✅ MongoDB URI Loaded:", process.env.MONGO_URI ? "Secure" : "Not Set");
console.log("✅ Email Credentials Loaded:", EMAIL_USER ? "Secure" : "Not Set");









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
        // OTP is valid; remove it from storage
        delete otpStorage[email];
        res.send({ success: true, message: 'Email OTP verified successfully.' });
    } else {
        res.status(400).send({ success: false, message: 'Invalid OTP.' });
    }
});


// Route to reset password

app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            console.log(`User not found for email: ${email}`);  // Debugging log
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the new password matches the old one
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(409).json({ message: 'New password cannot be the same as the old password.' });
        }

        // Hash the new password and update the user record
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
});







// ✅ Google OAuth Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://www.swarize.in/auth/google/callback",
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

// ✅ Serialize and Deserialize User
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
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "https://www.swarize.in/signin" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        res.redirect("https://www.swarize.in");
    }
);

// ✅ Sign-In Route (Matches Updated `signin.js`)
app.post("/api/auth/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found. Please sign up first." });
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ success: false, message: "Session error" });

            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.save((err) => {
                if (err) return res.status(500).json({ success: false, message: "Session save error" });

                res.json({ success: true, message: "Login successful!", userId: user._id, userName: user.name });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
});




// Forgot Password Route
app.get('/forgot-password', (req, res) => {
  res.send('<h1>Forgot Password Page (Implementation Pending)</h1>');
});

// Profile Route (After Successful Login)
app.get('/profile', (req, res) => {
  if (req.session.userId) {
    res.redirect('https://www.swarize.in/profile'); // ✅ Redirect user to profile page
  } else {
    res.redirect('https://www.swarize.in/signin'); // ✅ Redirect unauthenticated users to Sign In page
  }
});



// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });

      res.clearCookie("connect.sid");
      res.redirect("https://www.swarize.in/signin");
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
      console.error("❌ Error checking user profile:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});








// ===============   store ===================//
// Fetch Store Data
const multer = require("multer");


// ✅ Ensure uploaded files are saved in `public/uploads/`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');  // ✅ Fix: Move uploads to the public directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });


// Fetch store details for the logged-in user
// Fetch store details for the logged-in user
app.get("/api/store", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please sign in first." });
  }

  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) {
      return res.json({ success: false, message: "Store details not set." });
    }

    res.json({
      success: true,
      store: {
        storeName: store.storeName,
        storeLogo: `uploads/${store.storeLogo}`,
        description: store.description,
        country: store.country,
      },
    });
  } catch (error) {
    console.error("Error fetching store details:", error);
    res.status(500).json({ success: false, message: "Error fetching store details." });
  }
});


// Save store details
// Save store details
app.post("/api/store", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription } = req.body;
  const storeLogo = req.file?.filename;

  if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please sign in first." });
  }

  if (!storeName || !storeLogo) {
      return res.status(400).json({ success: false, message: "Store name and logo are required." });
  }

  try {
      // ✅ Fetch the user's email from the database
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      // ✅ Check if the store already exists
      const existingStore = await Store.findOne({ ownerId: req.session.userId });
      if (existingStore) {
          return res.status(400).json({ success: false, message: "Store already exists." });
      }

      // ✅ Create new store with ownerEmail
      const newStore = new Store({
          ownerId: req.session.userId,
          ownerEmail: user.email,  // ✅ Fix: Now ownerEmail is included
          storeName,
          storeLogo,
          description: storeDescription,
          country: "India",
      });

      await newStore.save();

      res.json({ success: true, message: "Store created successfully!", store: newStore });
  } catch (error) {
      console.error("Error saving store:", error);
      res.status(500).json({ success: false, message: "Failed to save store details." });
  }
});



app.delete("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  const userId = req.session?.userId || req.session?.passport?.user;

  if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
  }

  try {
      // ✅ Find product and check if the logged-in user is the owner
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: "Product not found." });
      }

      if (product.ownerId.toString() !== userId.toString()) {
          return res.status(403).json({ success: false, message: "Unauthorized: You cannot delete this product." });
      }

      await Product.findByIdAndDelete(productId);
      res.json({ success: true, message: "Product deleted successfully." });

  } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, message: "Error deleting product." });
  }
});


app.get('/api/products', async (req, res) => {
  console.log("🔹 Checking Authentication - Session Data:", req.session);

  // ✅ Ensure the user is logged in
  if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please sign in first." });
  }

  try {
      const userId = req.session.userId;
      const products = await Product.find({ ownerId: userId }); // ✅ Fetch only products of the logged-in user

      if (products.length === 0) {
          console.log("❌ No products found for user:", userId);
          return res.json({ success: true, message: "No products found.", products: [] });
      }

      console.log("✅ Returning products for user:", userId, products);
      res.status(200).json({ success: true, products });

  } catch (error) {
      console.error("❌ Error fetching products:", error);
      res.status(500).json({ success: false, message: "Error fetching products" });
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





// Product Model

// Sample data for categories and subcategories
const categoriesData = [
  {
    name: "Women's Store",
    subcategories: ["Sarees", "Kurtis", "Salwar Suits", "Western Dresses", "Tops", 
      "Leggings", "Palazzo Pants", "Jeans", "T-Shirts", "Nightwear",
      "Lehengas", "Anarkali Suits", "Dupattas", "Gowns",
      "Bras", "Panties", "Shapewear", "Camisoles",
      "Jackets", "Shawls", "Woolen Sweaters", "Scarves",
      "Heels", "Flats", "Bellies", "Sandals", "Wedges", 
      "Sneakers", "Ethnic Mojaris", "Boots",
      "Handbags", "Clutches", "Sunglasses", "Hair Accessories", "Watches"],
  },
  {
    name: "Men's Store",
    subcategories: [ "Shirts", "T-Shirts", "Formal Suits", "Blazers", "Jeans", 
      "Trousers", "Track Pants", "Hoodies", "Shorts",
      "Kurtas", "Sherwanis",
      "Vests", "Boxers", "Briefs",
      "Jackets", "Sweaters", "Gloves", "Caps",
      "Sneakers", "Formal Shoes", "Sandals", "Loafers", 
      "Flip Flops", "Sports Shoes", "Slippers",
      "Wallets", "Belts", "Ties", "Cufflinks", "Sunglasses"],
  },
  {
    name: "Kids' Store",
    subcategories: ["Casual Wear", "Party Wear", "Sleepwear", "School Uniforms", "Ethnic Wear",
      "Educational Toys", "Action Figures", "Dolls", "Puzzle Games", "Remote-Controlled Toys",
      "Bags", "Stationery", "Lunch Boxes", "Water Bottles",
      "Diapers", "Wipes", "Baby Blankets", "Bath Essentials",
      "Sandals", "Sports Shoes", "Slippers", "Casual Shoes", "School Shoes", "Bellies for Girls"],
  },
  {
    name: "Bags and Footwear",
    subcategories: ["Backpacks", "Handbags", "Wallets", "Laptop Bags", "Duffel Bags", 
      "Travel Bags", "Sling Bags",
      "Sneakers", "Sandals", "Loafers", "Flip Flops", "Formal Shoes", 
      "Boots", "Ethnic Mojaris", "Sports Shoes"],
  },
  {
    name: "Health and Beauty",
    subcategories: ["Moisturizers", "Sunscreens", "Face Wash", "Scrubs", "Face Masks", "Lip Balms",
      "Shampoos", "Conditioners", "Hair Oils", "Serums", "Hair Masks",
      "Lipsticks", "Foundations", "Mascaras", "Eyeliners", "Blush", "Nail Paints",
      "Deodorants", "Perfumes", "Body Wash", "Razors", "Wax Strips",
      "Vitamins", "Protein Powders", "Herbal Supplements", "First Aid Kits", "Masks", "Sanitizers",],
  },
  {
    name: "Jewelry and Accessories",
    subcategories: ["Gold-Plated Necklaces", "Kundan Necklaces", "Pearl Necklaces", "Chokers",
      "Stud Earrings", "Danglers", "Chandbalis", "Hoops", "Jhumkas",
      "Beaded Bracelets", "Cuff Bracelets", "Charm Bracelets",
      "Metal Bangles", "Glass Bangles", "Designer Bangles",
      "Adjustable Rings", "Cocktail Rings", "Diamond-Plated Rings",
      "Oxidized Anklets", "Silver Anklets", "Gold-Plated Anklets",
      "Single Stone Nose Pins", "Designer Nose Pins", "Hoop Nose Pins",
      "Watches", "Sunglasses", "Hair Bands", "Hair Clips", "Scarves", "Hats", "Brooches",],
  },
  {
    name: "Electronic Accessories",
    subcategories: ["Headphones", "Earphones (Wired & Wireless)", "Bluetooth Speakers",
      "Power Banks", "Mobile Chargers", "USB Cables", "Mobile Covers", "Tempered Glass",
      "Mouse", "Keyboards", "Laptop Cooling Pads", "Laptop Bags",
      "Smart Watches", "Fitness Bands", "Portable Fans", "LED Ring Lights",],
  },
  {
    name: "Sports and Fitness",
    subcategories: ["Cricket Bats", "Footballs", "Badminton Rackets", "Tennis Balls", "Basketballs",
      "Yoga Mats", "Dumbbells", "Resistance Bands", "Skipping Ropes",
      "Tracksuits", "Sports Bras", "Gym Shorts", "Jerseys",
      "Water Bottles", "Gym Bags", "Sweatbands", "Gloves", "Towel Bands",],
  },
  {
    name: "Home Decor and Kitchenware",
    subcategories: [ "Paintings", "Wooden Panels", "Posters",
      "Fairy Lights", "Table Lamps", "LED Strips", "Chandeliers",
      "Ceramic Vases", "Glass Vases", "Flower Pots",
      "Figurines", "Mini Statues", "Wall Hangings", "Wind Chimes",
      "Analog Clocks", "Digital Wall Clocks",
      "Door Mats", "Area Rugs", "Carpets",
      "Cushion Covers", "Throw Pillows",
      "Non-Stick Pans", "Pressure Cookers", "Frying Pans",
      "Airtight Containers", "Spice Racks", "Glass Jars",
      "Dinner Sets", "Bowls", "Serving Trays", "Cutlery Sets",
      "Peelers", "Graters", "Juicers", "Vegetable Choppers",],
  },
  {
    name: "Art and Craft",
    subcategories: ["Canvas Boards", "Easels", "Paint Brushes", "Acrylic Paints", 
      "Oil Paints", "Watercolors",
      "Sketch Pens", "Charcoal Pencils", "Colored Pencils", "Markers",
      "Origami Kits", "Jewelry Making Kits", "Sewing Kits",
      "Glitter", "Ribbons", "Sequins", "Beads", "Craft Papers",
      "Embroidery Kits", "Knitting Kits", "Calligraphy Sets",
      "Miniature Furniture", "Plastic Models",
      "Silicone Molds", "Pigments", "Resin Mix"],
  },
  // Add other categories and subcategories here...
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




// Route to fetch all products for all users (signed-in and non-signed-in)
router.get('/category/:category', async (req, res) => {
  try {
      const { category } = req.params;
      const products = await Product.find({ category }).limit(3); // Limit to 3 per category

      res.status(200).json({ success: true, products });
  } catch (error) {
      console.error("❌ Error fetching products:", error);
      res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});




app.get("/api/products", async (req, res) => {
  try {
      const products = await Product.find({});
      res.json({ success: true, products });
  } catch (error) {
      console.error("❌ Error fetching products:", error);
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
      console.error("❌ Error checking bank details:", error);
      res.status(500).json({ success: false, message: "Error checking bank details." });
  }
});








app.post("/api/payment/create-order", async (req, res) => {
  console.log("✅ Payment route is loaded."); // This must appear in terminal

  try {
      let { amount } = req.body;

      if (!amount || amount < 1) {
          console.error("❌ Invalid amount:", amount);
          return res.status(400).json({ success: false, message: "Minimum order amount must be at least ₹1" });
      }

      amount = amount * 100; // Convert to paisa

      const order = await razorpay.orders.create({
          amount: amount,
          currency: "INR",
          payment_capture: 1 
      });

      console.log("✅ Razorpay Order Created:", order);
      res.json({ success: true, orderId: order.id, amount: order.amount });

  } catch (error) {
      console.error("❌ Razorpay Order Error:", error);
      res.status(500).json({ success: false, message: "Payment order creation failed." });
  }
});




app.post("/api/orders/create", async (req, res) => {
  try {
    const { productId, buyerId, paymentId, promoCode } = req.body;  
    console.log("🔹 Order API Called:", { productId, buyerId, paymentId, promoCode });

      // ✅ Fetch Buyer, Seller, and Product Details
      const buyer = await User.findById(buyerId);
      const product = await Product.findById(productId).populate("ownerId");
      const seller = product ? product.ownerId : null;
      const store = seller ? await Store.findOne({ ownerId: seller._id }) : null;
      const buyerBank = await BankDetail.findOne({ userId: buyerId });
      let sellerBank = seller ? await BankDetail.findOne({ userId: seller._id }).lean() : null;

      console.log("🔍 Seller Bank Found:", sellerBank);
      console.log("✅ Buyer:", buyer);
      console.log("✅ Product:", product);
      console.log("✅ Seller:", seller);
      console.log("✅ Store:", store);
      console.log("✅ Buyer Bank:", buyerBank);

      // ✅ Check if any required data is missing
      if (!buyer || !product || !seller || !buyerBank) {
          console.log("❌ Invalid transaction details: Some data is missing");
          return res.status(400).json({ success: false, message: "❌ Invalid transaction details." });
      }

      if (!sellerBank) {
        console.warn("⚠️ Warning: Seller Bank details missing. Proceeding with default values...");
        sellerBank = {
            bankName: "Not Provided",
            accountHolder: "Not Provided",
            accountNumber: "0000000000",
            ifscCode: "XXXX0000000"
        };
      }

      // ✅ Validate store before saving anything
      if (!store) {
          console.error("❌ Error: Seller's store not found!");
          return res.status(400).json({ success: false, message: "Seller's store not found." });
      }

      // ✅ Store Order in Database
      const newOrder = new Order({
          productId,
          productName: product.name,
          productPrice: product.price,
          thumbnailImage: product.thumbnailImage,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags,
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
          thumbnailImage: product.thumbnailImage,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags,
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

      console.log("🛒 Sale Data Being Saved:", newSale);
      await newSale.save();

      console.log("✅ Order & Sale Recorded Successfully!");

       // ✅ Check and Mark Promo Code as Used if Applied
      if (promoCode) { 
        const expiredPromo = await PromoCode.findOneAndUpdate(
            { userId: buyerId, code: promoCode, isUsed: false },
            { isUsed: true },
            { new: true }
        );

        if (expiredPromo) {
            console.log("✅ Promo Code Expired:", expiredPromo.code);
        } else {
            console.warn("⚠️ Promo Code was already used or not found.");
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
        console.log("✅ Promo Code Sent Successfully to:", buyer.email);
    } else {
        console.log("✅ Existing promo code found:", existingPromo.code);
    }

    res.json({ success: true, message: "✅ Order & Promo Code Sent Successfully!" });


  } catch (error) {
      console.error("❌ Error saving order:", error);
      res.status(500).json({ success: false, message: "❌ Failed to save order." });
  }
});







// ✅ Fetch orders for a logged-in buyer
// ✅ Fetch orders for a logged-in buyer
app.get("/api/orders/buyer", async (req, res) => {
  try {
      const buyerId = req.session.userId;
      if (!buyerId) {
          console.log("❌ No buyerId found in session");
          return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });

      if (!orders.length) {
          return res.json({ success: true, orders: [] });
      }

      res.json({ success: true, orders });
  } catch (error) {
      console.error("❌ Error fetching buyer orders:", error);
      res.status(500).json({ success: false, message: "Server error!" });
  }
});



// ✅ Fetch sales for a logged-in seller
// ✅ Fetch sales for a logged-in seller
app.get("/api/orders/seller", async (req, res) => {
  try {
      const sellerId = req.session.userId;
      if (!sellerId) {
          console.log("❌ No sellerId found in session");
          return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      console.log("🔍 Fetching Sales for Seller ID:", sellerId);

      const sales = await Sale.find({ sellerId }).sort({ createdAt: -1 });

      if (!sales.length) {
          return res.json({ success: true, sales: [] });
      }

      res.json({ success: true, sales });
  } catch (error) {
      console.error("❌ Error fetching seller sales:", error);
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
      console.error("❌ Error applying promo code:", error);
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









const PORT = process.env.PORT || 3000;  // Use Render-assigned port
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
