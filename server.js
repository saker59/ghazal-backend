// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Needed to parse JSON request body
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Property model
const Property = require('./models/Property');

// Test route
app.get("/", (req, res) => {
  res.send("GHAZAL Backend is Running");
});

// GET all properties or filtered by type
app.get('/properties', async (req, res) => {
  const type = req.query.type;
  const query = type ? { type: type.toLowerCase() } : {};
  const properties = await Property.find(query).sort({ createdAt: -1 });
  res.json(properties);
});

// POST a new property
app.post('/properties', upload.single('image'), async (req, res) => {
  const { title, type, price, description, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const property = new Property({
    title,
    type,
    price,
    description,
    status,
    image,
  });

  await property.save();
  res.json({ success: true, property });
});

// DELETE a property
app.delete('/properties/:id', async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// UPDATE a property
app.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const updates = { title, type, price, description, status };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, property: updated });
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});
// Simple login route (hardcoded admin credentials)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Replace these with secure credentials in production
  const ADMIN_USERNAME = 'rania';
  const ADMIN_PASSWORD = 'rania12345';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
