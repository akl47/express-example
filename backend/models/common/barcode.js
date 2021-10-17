'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Barcode extends Model {
    static associate(models) {
      Barcode.belongsTo(models.BarcodeCategory,{
        foreignKey: 'barcodeCategoryID',
        onDelete: 'CASCADE'
      })
    }
  };
  Barcode.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true
    },
    barcodeCategoryID: {
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
  }, {
    hooks: {
      beforeValidate: async (barcode, options) => {
        let next_id = await sequelize.query("SELECT nextval('\"Barcodes_id_seq\"');")
        let prefix = await sequelize.query("select prefix from \"BarcodeCategories\" where id = "+barcode.barcodeCategoryID)
        barcode.barcode = prefix[0][0].prefix+'-'+(parseInt(next_id[0][0].nextval)+1).toString(16).padStart(6,'0').toUpperCase();        
      },
    },
    sequelize,
    modelName: 'Barcode',
  });
  return Barcode;
};