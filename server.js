require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ===== Multer =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== Models =====
const Property = require('./models/Property');

// ===== API =====

// Get all properties (with optional filter)
app.get('/properties', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type: type.toLowerCase() } : {};
    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (e) {
    console.error("❌ Error fetching properties:", e);
    res.status(500).json({ success: false, message: 'Failed to fetch properties', error: e.message });
  }
});

// Add new property
app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const property = new Property({ title, type, price, description, status, image });
    await property.save();

    res.json({ success: true, property });
  } catch (e) {
    console.error("❌ Error adding property:", e);
    res.status(500).json({ success: false, message: 'Failed to add property', error: e.message });
  }
});

// Update property
app.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const updates = { title, type, price, description, status };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, property: updated });
  } catch (e) {
    console.error("❌ Error updating property:", e);
    res.status(500).json({ success: false, message: 'Update failed', error: e.message });
  }
});

// Delete property
app.delete('/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    console.error("❌ Error deleting property:", e);
    res.status(500).json({ success: false, message: 'Failed to delete property', error: e.message });
  }
});

// Admin login
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === 'rania' && password === 'rania12345') {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (e) {
    console.error("❌ Login error:", e);
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
});

// ===== Start =====
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
