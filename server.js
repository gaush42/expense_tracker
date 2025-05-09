// Import Node.js filesystem module for file operations
const fs = require('fs');

// Import Node.js path module for working with file/directory paths
const path = require('path');

// Import Expess framework to create a web server
const express = require('express');

// Import Morgan HTTP request logger middleware
const morgan = require('morgan');

// Import Sequelize instance from database configuration
const sequelize = require('./config/dbConfig');

// import route handlers for different features
const userRoutes = require('./routes/userRoute');
const expenseRoute = require('./routes/expenseRoute');
const paymentRoute = require('./routes/paymentRoutes');

const paymentController = require('./controller/paymentController')

// Load environment variables from .env file
require("dotenv").config();

// Create Express application instance
const app = express()

// Set port from env variable or default tp 3000
const PORT = process.env.PORT || 3000;

// Create a write stream for logging (in append mode)
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Configure Morgan to log HTTP requests in 'combined' format to our log file
app.use(morgan('combined', { stream: logStream }));

// Middleware to parse JSON request bodies
app.use(express.json())
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Mount route handlers under '/api' base path
app.use('/api', userRoutes)
app.use('/api', expenseRoute)
app.use('/api',paymentRoute)

// Serve static files from 'view' directory
app.use(express.static('view'))

// Sync all defined models with the database
sequelize.sync()
  .then(() => {
    console.log('✅ Database connected and synced');
    // Start the Express server after database sync
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect/sync database:', err);
    process.exit(1);
});
