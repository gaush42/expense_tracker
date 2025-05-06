const express = require('express')
const path = require('path');
const sequelize = require('./config/dbConfig')
const userRoutes = require('./routes/userRoute')
const expenseRoute = require('./routes/expenseRoute')
const paymentRoute = require('./routes/paymentRoutes')
const app = express()

const PORT = 3000
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes)
app.use('/api', expenseRoute)
app.use('/api',paymentRoute)

app.use(express.static('view'))

sequelize.sync()
    .then(()=>{
    console.log('Database connected and synced')
    app.listen(PORT, () =>{
        console.log(`Server is running on port ${PORT}`)
    })
})
