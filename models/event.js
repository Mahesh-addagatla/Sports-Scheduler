'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.User, { foreignKey: 'adminId' }); // Assuming the User model is where Admins are stored
      Event.hasMany(models.PlayerEvent, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Event.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false
    },
    team_limit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
