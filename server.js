// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- Middleware -------------------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the static frontend (all files under /public)
app.use(express.static(path.join(__dirname, 'public')));

/* -------------------- DB Connection -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/* -------------------- Multer (file uploads) -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* -------------------- Models -------------------- */
const Property = require('./models/Property');

/* -------------------- API Routes -------------------- */

// GET all properties (optional filter by type: /properties?type=rental|sale)
app.get('/properties', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type: type.toLowerCase() } : {};
    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

// POST a new property
app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const property = new Property({ title, type, price, description, status, image });
    await property.save();

    res.json({ success: true, property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add property' });
  }
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
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// DELETE a property
app.delete('/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
});

// Simple admin login (hardcoded)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = 'rania';
  const ADMIN_PASSWORD = 'rania12345';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

/* -------------------- Static Pages -------------------- */
// Optional: ensure root serves index explicitly (static middleware already handles it)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* -------------------- Start Server -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
