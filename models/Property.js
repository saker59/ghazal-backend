// models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // will store image path
  type: { type: String, required: true }, // "rental" or "sale"
  price: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['available', 'rented', 'sold'], default: 'available' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', PropertySchema);