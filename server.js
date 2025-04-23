const express = require('express')
const sequelize = require('./config/dbConfig')
const regRoutes = require('./routes/userRoute')
const expenseRoute = require('./routes/expenseRoute')
const app = express()

const PORT = 3000
app.use(express.json())
app.use('/api', regRoutes)
app.use('/api', expenseRoute)
app.use(express.static('view'))

sequelize.sync()
    .then(()=>{
    console.log('Database connected and synced')
    app.listen(PORT, () =>{
        console.log(`Server is running on port ${PORT}`)
    })
})
