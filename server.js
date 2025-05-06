const fs = require('fs');
const path = require('path');

const express = require('express')
const morgan = require('morgan')
const sequelize = require('./config/dbConfig')
const userRoutes = require('./routes/userRoute')
const expenseRoute = require('./routes/expenseRoute')
const paymentRoute = require('./routes/paymentRoutes')

require("dotenv").config();

const app = express()

const PORT = process.env.PORT || 3000;

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes)
app.use('/api', expenseRoute)
app.use('/api',paymentRoute)

app.use(express.static('view'))

sequelize.sync()
  .then(() => {
    console.log('✅ Database connected and synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect/sync database:', err);
    process.exit(1); // Exit process with failure
});
