'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name:{
        type: DataTypes.STRING(16),
        allowNull:true
      },
      description: {
        type: DataTypes.STRING(62),
        allowNull:true
      },
      barcodeID: {
        type: DataTypes.INTEGER,
        allowNull:false,
        unique:true
      },
      parentBarcodeID: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      activeFlag: {
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations');
  }
};