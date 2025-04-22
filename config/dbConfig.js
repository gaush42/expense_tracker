const { Sequelize } = require("sequelize")

const sequelize = new Sequelize("expense","root","root", {
    host:"localhost",
    dialect:"mysql",
})

module.exports = sequelize