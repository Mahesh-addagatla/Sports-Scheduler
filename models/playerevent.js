// models/playerEvent.js

'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlayerEvent = sequelize.define('PlayerEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});

  PlayerEvent.associate = function(models) {
    PlayerEvent.belongsTo(models.User, {
      foreignKey: 'playerId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    PlayerEvent.belongsTo(models.Event, {
      foreignKey: 'eventId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return PlayerEvent;
};
