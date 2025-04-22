const {DataTypes} = require('sequelize')
const sequelize = require('../config/dbConfig')

const User = sequelize.define('User', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    fullname:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {isEmail: true},
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})
module.exports = User