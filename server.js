require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static frontend files

// ===== MONGODB CONNECTION =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== MULTER CONFIG =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== MODEL =====
const Property = require('./models/Property');

// ===== API ROUTES =====

// GET all properties or filtered by type
app.get('/properties', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type: type.toLowerCase() } : {};
    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch properties" });
  }
});

// POST new property
app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { title, type, price, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const property = new Property({ title, type, price, description, status, image });
    await property.save();
    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add property" });
  }
});

// PUT update property
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

// DELETE property
app.delete('/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete property" });
  }
});

// ADMIN LOGIN
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

// ===== FRONTEND FALLBACK ROUTE (For direct links like /admin.html or /sales.html) =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
