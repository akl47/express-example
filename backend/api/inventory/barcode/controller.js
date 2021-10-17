const db = require('../../../models');
const fetch = require('request-promise');
var fs = require('fs');
var request = require('request');
const Net = require('net')

exports.getQueuedUpdatedByID = (req, res, next) => {
  db.QueuedUpdate.findOne({where:{id:req.params.id}}).then(
    queuedUpdate => {
      res.json(queuedUpdate)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Queued Update:'+error, 500))
  });
}

exports.printBarcode = (req,res,next) => {
  let display_barcode = {};
  let zpl = ''
  barcodeID = req.params.id
  db.Barcode.findOne({
    where:{
      id:barcodeID,
      activeFlag:true
    },
    include: {model: db.BarcodeCategory}
  }).then(barcode=>{
    barcode = barcode.toJSON()
    // console.log(barcode)
    display_barcode.barcode= barcode.barcode
    zpl = `
    ^XA
  
    ^FO7,33^GFA,1512,1512,14,,:::::::::::::::::::::::::::::::Q0EI03,P03F801FE,P0FFC03FF,O03FBE03CFC,O0FE0E0783F,N03F80E0700FE,N0FE0C607103F8,M07FC1C607381FE,L01IF0C607387FF8,L0JFC0E0701JF,K03JFE0IF03JFE,J01LF0IF87KF8,J07LF8IF9MF,I01MFCE079MFC,I07JFE07CE03BIF83F7E,I0F8IFE03EE03JF01F0F8,001F0IFC03FE03JF00F87C,003C1IFC03FE03IFE00F83E,00781IFC03FC03IFE00FC0E,00701IFC03FC01JF01FC0F,00F01IFE07FC01JF81FC078,00E01JF0OFC7FC038,01C61FFC7OF1IFC63C,01C71FFC7IF800FFE1IFC71C,03C71FFC7IF800IF1IFC61C,03801MFI0MF801C,03800MFI07LF800C,03800MF800MF800E,03800WFI0E,038007VFI0E,038003KFCIFBKFEI0E,038003KFC0F01KFCI0C,038001KF8J0KF8001C,03CI0KF8J0KFI01C,01CI03JFK07IFEI01C,01CJ0JFK0JF8I038,00EJ01F3F8I01FCFCJ038,00FL07FCI03FEL078,007I0600F9KFCF003I0F,007800E01F0KF87807I0E,003C00603E07JF03E03003E,001EJ07C07800F03FJ07C,I0F8001FFBF800JFC001F8,I07F007EIF800IF3F007E,I01JF83FF800FFE1JFC,J07FFEI03800EI07IF,K0FF8I03800EJ0FF8,Q03800E,::Q03IFE,Q0KF,P01KF8,P01EI03C,P01CI01C,::P01F8IFC,P01FCIFC,P01CI01C,:::::P01KFC,:P01CI01C,:::001gGFC,003gGFE,00gIF8,03FJ07Q0EJ0FC,07FJ07Q0EJ07F,^FS
  
    ^FO15,147^A0N,13,13^FDLETWINVENTORY^FS
    ^FO493,46
    ^BXN,7,200
    ^FD${barcode.barcode}
    ^FS
    ^FO500,160^A0N,17,17^FD${barcode.barcode}^FS`
    switch(barcode.BarcodeCategory.prefix) {
      case "LOC":
        // console.log("LOCATION")
        db.Location.findOne({
          where: {
            barcodeID:barcode.id,
            activeFlag:true
          }
        }).then(location=>{
          location = location.toJSON()
          display_barcode.name = location.name
          display_barcode.description = location.description
          zpl+= `
          ^FO120,58^A0N,46,46^FD${display_barcode.name}^FS

          ^CF0,23,23^FO120,102
             ^FB367,2,,,
             ^FX 62 char limit
             ^FD ${display_barcode.description}
             ^FS
             ^XZ
             `
             printZPL(zpl)
             
        })
        break
      case "BOX":
        // console.log("BOX")
        db.Box.findOne({
          where: {
            barcodeID:barcode.id,
            activeFlag:true
          }
        }).then(box=>{
          box = box.toJSON()
          display_barcode.name = box.name
          display_barcode.description = box.description
          zpl+= `
          ^FO120,58^A0N,46,46^FD${display_barcode.name}^FS

          ^CF0,23,23^FO120,102
             ^FB367,2,,,
             ^FX 62 char limit
             ^FD ${display_barcode.description}
             ^FS
             ^XZ
             `
             printZPL(zpl)
        })
        break
      default:
        // TODO raise error
        console.log("ERROR BAD BARCODE TYPE")
    }
  }).catch(error=>{
    next(new RestError('Error Getting Barcode:'+error, 500))
  })

  function printZPL(zpl) {
    console.log("PRINTING TO SHIPPING CONTAINER!!!")
    // var client = new Net.Socket();
    // client.connect({
    //   port: 9100,
    //   host: "10.50.0.78"
    // }, function() {
    //   
    //   // client.write(zpl);
    //   client.destroy();
    // });
    res.json({message:"Done"})
  }
}

exports.displayBarcode = (req,res,next) => {
  let display_barcode = {};
  let zpl = ''
  barcodeID = req.params.id
  db.Barcode.findOne({
    where:{
      id:barcodeID,
      activeFlag:true
    },
    include: {model: db.BarcodeCategory}
  }).then(barcode=>{
    barcode = barcode.toJSON()
    // console.log(barcode)
    display_barcode.barcode= barcode.barcode
    zpl = `
    ^XA
  
    ^FO7,33^GFA,1512,1512,14,,:::::::::::::::::::::::::::::::Q0EI03,P03F801FE,P0FFC03FF,O03FBE03CFC,O0FE0E0783F,N03F80E0700FE,N0FE0C607103F8,M07FC1C607381FE,L01IF0C607387FF8,L0JFC0E0701JF,K03JFE0IF03JFE,J01LF0IF87KF8,J07LF8IF9MF,I01MFCE079MFC,I07JFE07CE03BIF83F7E,I0F8IFE03EE03JF01F0F8,001F0IFC03FE03JF00F87C,003C1IFC03FE03IFE00F83E,00781IFC03FC03IFE00FC0E,00701IFC03FC01JF01FC0F,00F01IFE07FC01JF81FC078,00E01JF0OFC7FC038,01C61FFC7OF1IFC63C,01C71FFC7IF800FFE1IFC71C,03C71FFC7IF800IF1IFC61C,03801MFI0MF801C,03800MFI07LF800C,03800MF800MF800E,03800WFI0E,038007VFI0E,038003KFCIFBKFEI0E,038003KFC0F01KFCI0C,038001KF8J0KF8001C,03CI0KF8J0KFI01C,01CI03JFK07IFEI01C,01CJ0JFK0JF8I038,00EJ01F3F8I01FCFCJ038,00FL07FCI03FEL078,007I0600F9KFCF003I0F,007800E01F0KF87807I0E,003C00603E07JF03E03003E,001EJ07C07800F03FJ07C,I0F8001FFBF800JFC001F8,I07F007EIF800IF3F007E,I01JF83FF800FFE1JFC,J07FFEI03800EI07IF,K0FF8I03800EJ0FF8,Q03800E,::Q03IFE,Q0KF,P01KF8,P01EI03C,P01CI01C,::P01F8IFC,P01FCIFC,P01CI01C,:::::P01KFC,:P01CI01C,:::001gGFC,003gGFE,00gIF8,03FJ07Q0EJ0FC,07FJ07Q0EJ07F,^FS
  
    ^FO15,147^A0N,13,13^FDLETWINVENTORY^FS
    ^FO493,46
    ^BXN,7,200
    ^FD${barcode.barcode}
    ^FS
    ^FO500,160^A0N,17,17^FD${barcode.barcode}^FS`
    switch(barcode.BarcodeCategory.prefix) {
      case "LOC":
        // console.log("LOCATION")
        db.Location.findOne({
          where: {
            barcodeID:barcode.id,
            activeFlag:true
          }
        }).then(location=>{
          location = location.toJSON()
          display_barcode.name = location.name
          display_barcode.description = location.description
          zpl+= `
          ^FO120,58^A0N,46,46^FD${display_barcode.name}^FS

          ^CF0,23,23^FO120,102
             ^FB367,2,,,
             ^FX 62 char limit
             ^FD ${display_barcode.description}
             ^FS
             ^XZ
             `
             res.send(zpl)
             
        })
        break
      case "BOX":
        // console.log("BOX")
        db.Box.findOne({
          where: {
            barcodeID:barcode.id,
            activeFlag:true
          }
        }).then(box=>{
          box = box.toJSON()
          display_barcode.name = box.name
          display_barcode.description = box.description
          zpl+= `
          ^FO120,58^A0N,46,46^FD${display_barcode.name}^FS

          ^CF0,23,23^FO120,102
             ^FB367,2,,,
             ^FX 62 char limit
             ^FD ${display_barcode.description}
             ^FS
             ^XZ
             `
             res.send(zpl)
        })
        break
      default:
        // TODO raise error
        console.log("ERROR BAD BARCODE TYPE")
    }
  }).catch(error=>{
    next(new RestError('Error Getting Barcode:'+error, 500))
  })

}

exports.getTagByID = (req,res,next) => {
  let tag = {}
  db.Barcode.findOne({
    where: {
      id: req.params.id,
      activeFlag:true
    },
    include: {model: db.BarcodeCategory}
  }).then(barcode=>{
    barcode = barcode.toJSON()
    // console.log(barcode)
    tag.barcodeID = barcode.id
    
    tag.barcode = barcode.barcode
    tag.type = barcode.BarcodeCategory.name
    tag.barcodeCategoryID = barcode.BarcodeCategory.id
    db[tag.type].findOne({
      where:{
        barcodeID:tag.barcodeID,
        activeFlag: true
      }
    }).then(tagResults=>{
      tagResults = tagResults.toJSON()
      tag.id = tagResults.id
      tag.parentBarcodeID = tagResults.parentBarcodeID
      tag.name = tagResults.name
      tag.description = tagResults.description
      res.json(tag)
    }).catch(error=>{
      console.log("Error:",error)
    })
  }).catch(error=>{
    next(new RestError('Error Getting Barcode:'+error, 500))
  })
}

exports.getAllTags = (req,res,next)=>{
  db.sequelize.query(
    `select b.*, l.name, l.description, l."parentBarcodeID" from "Barcodes" as b
    join "Locations" as l
    on l."barcodeID" = b.id
    where b."activeFlag"=true
    
    union all
    
    select b.*, l.name, l.description, l."parentBarcodeID" from "Barcodes" as b
    join "Boxes" as l
    on l."barcodeID" = b.id
    where b."activeFlag"=true`
  ).then(results=>{
    res.json(results[0])
  }).catch(error=>{
    next(new RestError('Error Getting Barcode:'+error, 500))
  })
}

exports.getAllBarcodes = (req,res,next) => {
  db.Barcode.findAll({
    where:{
      activeFlag:true
    }
  }).then(barcodes=>{
    res.json(barcodes)
  }).catch(error=>{
    next(new RestError('Error Getting Barcodes:'+error, 500))
  })
} 

exports.getBarcodeCategories = (req,res,next) => {
  db.BarcodeCategory.findAll({
    where: {
      activeFlag:true
    }
  }).then(barcodeCategories=>{
    res.json(barcodeCategories)
  }).catch(error=>{
    next(new RestError('Error Getting Barcode Categories:'+error, 500))
  })
}

exports.deleteBarcodeByID = (req,res,next) => {
  console.log("DELETING BARCODE")
  // Find Barcode
  db.Barcode.findOne({
    where:{
      id: req.params.id,
      // activeFlag:true
    },
    include: {model: db.BarcodeCategory}
  }).then(barcode=>{
    barcode = barcode.toJSON()
    console.log("Found Barcode:",barcode)
    // Update Barcode
    barcode.activeFlag = false
    db.Barcode.update(barcode,{
      where: {
        id: barcode.id
      }
    }).then(updatedBarcode=>{
      console.log("Barcode Updated")
    }).catch(error=>{
      next(new RestError('Error Updating Barcode:'+error, 500))
    })
    // Find Tag
    db[barcode.BarcodeCategory.name].findOne({
      where: {barcodeID:barcode.id}
    }).then(tag=>{
      tag = tag.toJSON()
      console.log("Found Tag: ",tag)
      // Update Tag
      tag.activeFlag = false
      db[barcode.BarcodeCategory.name].update(tag,{
        where:{id:tag.id}
      }).then(updatedTag=>{
        console.log("Tag Updated")
      }).catch(error=>{
        next(new RestError(`Error Updating Tag ${barcode.BarcodeCategory.name} :`+error, 500))
      })
      // Find All Barcode Categories
      db.BarcodeCategory.findAll({
        where: {
          activeFlag:true
        }
      }).then(barcodeCategories=> {
        // Update all barcode category where parent id was old barcode id
        let message = ''
        barcodeCategories.forEach(barcodeCategory=>{
          barcodeCategory = barcodeCategory.toJSON()
          updateScript = `Update "${barcodeCategory.tableName}" set "parentBarcodeID"=${tag.parentBarcodeID} where "parentBarcodeID" = ${tag.barcodeID};`
          db.sequelize.query(updateScript).then(results=>{
            message += `Updated ${barcodeCategory.tableName}. `
          }).catch(error=>{
            next(new RestError('Error Updating Barcode ID:'+error, 500))
          })
        })
        res.json({message:message}) //TODO Fix this
      }).catch(error=>{
        next(new RestError('Error Getting Barcode Categories:'+error, 500))
      })
    }).catch(error=>{
      next(new RestError('Error Getting Tag:'+error, 500))
    })
  }).catch(error=>{
    next(new RestError('Error Getting Barcode:'+error, 500))
  })
}