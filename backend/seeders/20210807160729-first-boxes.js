'use strict';
const db = require('../models'); // Assuming migrations is next to models


module.exports = {
  up: async (queryInterface, Sequelize) => {
    let loc_category_id = await db.BarcodeCategory.findOne({
      where: {
        prefix: "LOC"
      }
    })
    let box_category_id = await db.BarcodeCategory.findOne({
      where: {
        prefix: "BOX"
      }
    })
    const earthBarcode = await db.Barcode.create({barcodeCategoryID: loc_category_id.dataValues.id})
    const earth = await db.Location.create({
      name: 'Earth',
      description: 'Pale Blue Dot',
      barcodeID: earthBarcode.dataValues.id,
      parentBarcodeID: 0,
    })

    const fremontBarcode = await db.Barcode.create({barcodeCategoryID: loc_category_id.dataValues.id})
    const fremont = await db.Location.create({
      name: 'Fremont',
      description: '',
      barcodeID: fremontBarcode.dataValues.id,
      parentBarcodeID: earth.dataValues.barcodeID,
    })

    const shippingContainerBarcode = await db.Barcode.create({barcodeCategoryID: loc_category_id.dataValues.id})
    const shippingContainer = await db.Location.create({
      name: 'HMS NotPermitted',
      description: 'Shipping container',
      barcodeID: shippingContainerBarcode.dataValues.id,
      parentBarcodeID: fremont.dataValues.barcodeID,
    })

    for(let i = 0;i<=4;i++) {
      const shelfBarcode = await db.Barcode.create({barcodeCategoryID: loc_category_id.dataValues.id})
      const shelf = await db.Location.create({
        name: 'Shelf '+i,
        description: '',
        barcodeID: shelfBarcode.dataValues.id,
        parentBarcodeID: shippingContainer.dataValues.barcodeID,
      })
      
      for(let j=1;j<=10;j++) {
        const boxBarcode = await db.Barcode.create({barcodeCategoryID: box_category_id.dataValues.id})
        const box = await db.Box.create({
          name: 'Box '+(100*i+j),
          description: '',
          barcodeID: boxBarcode.dataValues.id,
          parentBarcodeID: shelf.dataValues.barcodeID,
        })
      }
    }

    
    
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Boxes', null, {});
    await queryInterface.bulkDelete('Locations', null, {});
    return queryInterface.bulkDelete('Traces', null, {});
  }
};
