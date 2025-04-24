const {DataTypes} = require('sequelize')
const sequelize = require('../config/dbConfig')

const Order = sequelize.define('Order', {
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentSessionId: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
      defaultValue: 'PENDING',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
});
module.exports = Order