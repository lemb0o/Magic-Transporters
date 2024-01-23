const mongoose = require('mongoose');
const Joi = require('joi');

const questStateEnum = ['resting', 'loading', 'onMission', 'done'];

// MagicItem schema
const MagicItemSchema = new mongoose.Schema({
  name: String,
  weight: Number,
  loadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MagicMover', default: null },
});

const MagicMoverSchema = new mongoose.Schema({
  name: String,
  weightLimit: Number,
  energy: Number,
  lastEnergyUpdate: { type: Date, default: Date.now },
  questState: {
    type: String,
    enum: questStateEnum,
    default: 'resting',
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MagicItem' }],
  completedMissions: { type: Number, default: 0 },
});

const MagicItem = mongoose.model('MagicItem', MagicItemSchema);
const MagicMover = mongoose.model('MagicMover', MagicMoverSchema);

// Joi validation schema for MagicItem
const magicItemValidationSchema = Joi.object({
  name: Joi.string().required(),
  weight: Joi.number().required(),
});

// Joi validation schema for MagicMover
const magicMoverValidationSchema = Joi.object({
  name: Joi.string().required(),
  weightLimit: Joi.number().required(),
  energy: Joi.number().required(),
  questState: Joi.string().valid(...questStateEnum).default('resting'),
  items: Joi.array().items(Joi.string()), // Adjust this depending on the type of ObjectId used
  completedMissions: Joi.number().default(0),
});

module.exports = { MagicItem, MagicMover, magicItemValidationSchema, magicMoverValidationSchema };
