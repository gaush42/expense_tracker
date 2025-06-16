const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoute');
const expenseRoute = require('./routes/expenseRoute');
const paymentRoute = require('./routes/paymentRoutes');
const connectDB = require('./config/dbConfig');

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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
