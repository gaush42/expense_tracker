const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = ForgotPasswordRequest;
