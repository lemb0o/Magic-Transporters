const { MagicMover, MagicItem, magicItemValidationSchema, magicMoverValidationSchema } = require('../models/models');
const Joi = require('joi');
const logger = require('../logs/winston');



// Function to log activity
const logActivity = (level, message, details) => {
  logger.log({
    level,
    message,
    details,
  });
};

// List the mover with the most completed missions
exports.listMostCompletedMissions = async (req, res) => {
  try {
    const mostCompletedMover = await MagicMover.findOne()
      .sort({ completedMissions: -1 })
      .select('name completedMissions'); // Only select the name and completedMissions fields

    if (!mostCompletedMover || mostCompletedMover.completedMissions === 0) {
      return res.status(404).json({ error: 'No mover with completed missions found' });
    }

    res.status(200).json(mostCompletedMover);
  } catch (error) {
    console.log('error', 'Error listing most completed missions', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


  


  exports.addMagicMover = async (req, res) => {
    try {
      const { error, value } = magicMoverValidationSchema.validate(req.body);
  
      if (error) {
        logActivity('error', 'Validation error adding Magic Mover', { error: error.message });
        return res.status(400).json({ error: 'Validation error', details: error.details });
      }
  
      const { name, weightLimit, energy } = value;
      // Check if a mover with the same name already exists
      const existingMover = await MagicMover.findOne({ name });
      if (existingMover) {
        return res.status(400).json({ error: 'A mover with the same name already exists' });
      }

      const newMover = new MagicMover({
        name,
        weightLimit,
        energy,
      });
  
      await newMover.save();
  
      logActivity('info', 'Magic Mover added', { moverId: newMover._id });
  
      res.status(201).json({ message: 'Magic Mover added successfully', mover: newMover });
    } catch (error) {
      logActivity('error', 'Error adding Magic Mover', { error: error.message });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Add a Magic Item
  exports.addMagicItem = async (req, res) => {
    try {
      const { error, value } = magicItemValidationSchema.validate(req.body);
  
      if (error) {
        logActivity('error', 'Validation error adding Magic Item', { error: error.message });
        return res.status(400).json({ error: 'Validation error', details: error.details });
      }
  
      const { name, weight } = value;
      const existingItem = await MagicItem.findOne({ name });
      if (existingItem) {
        return res.status(400).json({ error: 'An item with the same name already exists' });
      }

      const newItem = new MagicItem({
        name,
        weight,
      });
  
      await newItem.save();
  
      logActivity('info', 'Magic Item added', { itemId: newItem._id });
  
      res.status(201).json({ message: 'Magic Item added successfully', item: newItem });
    } catch (error) {
      logActivity('error', 'Error adding Magic Item', { error: error.message });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Load a Magic Mover with items, creating a log of this activity (loading state)
exports.loadMover = async (req, res) => {
    try {
      const { moverId } = req.params;
      const { itemId } = req.body;
  
      const mover = await MagicMover.findById(moverId);
  
      if (!mover) {
        return res.status(404).json({ error: 'Mover not found' });
      }
  
      if (mover.questState !== 'resting' && mover.questState !== 'loading') {
        return res.status(400).json({ error: 'Mover is not in resting or loading state' });
      }
  
      const item = await MagicItem.findById(itemId);
  
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
  
      if (item.loadedBy) {
        return res.status(400).json({ error: 'Item is already loaded', loadedBy: item.loadedBy });
      }
  
      const totalWeight = await Promise.all(
        mover.items.map(async (loadedItemId) => {
          const loadedItem = await MagicItem.findById(loadedItemId);
          return loadedItem.weight;
        })
      );
  
      const currentTotalWeight = totalWeight.reduce((acc, weight) => acc + weight, 0);
  
      if (currentTotalWeight + item.weight > mover.weightLimit) {
        return res.status(400).json({ error: 'Total weight exceeds mover limit for loading' });
      }
  
      // Update the item's loadedBy field
      item.loadedBy = mover._id;
      await item.save();
  
      // Update the mover's quest state to "loading"
      mover.questState = 'loading';
      mover.items.push(itemId);
      await mover.save();
  
      logActivity('info', 'Item loaded, Mover is now loading', { moverId, itemId });
    
      res.status(200).json({ message: 'Item loaded successfully, Mover is now loading', mover });
    } catch (error) {
      logActivity('error', 'Error loading Mover', { error: error.message });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  
  
// Start a Mission — update the Magic Mover’s state to on a mission and stop loading more,
// creating a log of this activity (on a mission)
exports.startMission = async (req, res) => {
  try {
    const { moverId } = req.params;

    const mover = await MagicMover.findById(moverId);

    if (!mover) {
      console.log('error', 'Mover not found for starting mission', { moverId });
      return res.status(404).json({ error: 'Mover not found' });
    }

    if (mover.questState !== 'loading') {
      console.log('error', 'Mover cannot start mission while not loading', { moverId });
      return res.status(400).json({ error: 'Mover is not in loading state' });
    }

    // Start the mission
    mover.questState = 'onMission';
    await mover.save();

    logActivity('info', 'Mission started', { moverId });

    res.status(200).json({ message: 'Mission started successfully', mover });
  } catch (error) {
    console.log('error', 'Error starting mission for Mover', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// End a Mission — unload everything from the Magic Mover, creating a log of
// this activity (mission complete / done)
exports.endMission = async (req, res) => {
    try {
      const { moverId } = req.params;
  
      const mover = await MagicMover.findById(moverId);
  
      if (!mover) {
        logActivity('error', 'Mover not found for ending mission', { moverId });
        return res.status(404).json({ error: 'Mover not found' });
      }
  
      if (mover.questState !== 'onMission') {
        logActivity('error', 'Mover cannot end mission while not on a mission', { moverId });
        return res.status(400).json({ error: 'Mover is not on a mission' });
      }
  
      // Unload items and mark them as free
      await Promise.all(mover.items.map(async (itemId) => {
        const item = await MagicItem.findById(itemId);
        item.loadedBy = null;
        await item.save();
      }));
  
      // Clear the mover's items and update quest state to "done"
      mover.items = [];
      mover.questState = 'done';
      mover.completedMissions += 1;
      mover.questState = 'resting';
      await mover.save();
  
      logActivity('info', 'Mission ended, items unloaded', { moverId });
  
      res.status(200).json({ message: 'Mission ended successfully, items unloaded', mover });
    } catch (error) {
      logActivity('error', 'Error ending mission for Mover', { error: error.message });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
