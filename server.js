require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // serves Rentals.html, Sales.html, etc.

// Explicit routes for your static pages (optional but safer)
app.get('rentals.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rentals.html'));
});

app.get('sales.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sales.html'));
});

app.get('construction.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'construction.html'));
});

// });

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
app.get('/properties', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type: type.toLowerCase() } : {};
    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const property = new Property({ title, type, price, description, status, image });
    await property.save();
    res.json({ success: true, property });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to add property' });
  }
});

app.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const updates = { title, type, price, description, status };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    const updated = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, property: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

app.delete('/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'rania' && password === 'rania12345') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ===== Start =====
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
