const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('./logs/winston');
const controllers = require('./controllers/controllers');
const { startAnimation, stopAnimation } = require('console-animations');

const app = express();



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/magic');



// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

// Routes
app.post('/api/mover', controllers.addMagicMover);
app.post('/api/item', controllers.addMagicItem);
app.post('/api/mover/:moverId/load', controllers.loadMover);
app.post('/api/mover/:moverId/start-mission', controllers.startMission);
app.post('/api/mover/:moverId/end-mission', controllers.endMission);

// Fix the route handler for GET request
app.get('/api/most-completed-missions', controllers.listMostCompletedMissions);

// Server listening on port 3000 (you can change the port as needed)
const PORT = process.env.PORT || 3000;
// Display an animation or message before starting the server
console.log('<------------ Mover ... Movers ... Move ------------>');
startAnimation('spinner', 1)
setTimeout(() => {
  app.listen(PORT, () => {
    console.log(`Magic Transporters is running on port ${PORT}`);
  });
}, 2000); // Adjust the delay time as needed
