'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {}
  };
  Test.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    activeFlag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Test',
  });

  return Test;
};