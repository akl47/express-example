const db = require('../../../models');

exports.getLocationHigherarchy = async (req, res, next) => {
  /**
   * Get all Locations
   * Get all Boxes
   * Get all parts
   * starting at barcode 0, find children
   */
  // TODO refactor this to be better and promise based
  let locations = await db.Location.findAll({
    include: {
      model: db.Barcode,
      required: true,
      include: {
        model: db.BarcodeCategory,
        required: true,
      }
    },
    where: {activeFlag:true}
  })

  locations = locations.map(location=>{ 
    return location.toJSON() 
  });

  let boxes = await db.Box.findAll({
    include: {
      model: db.Barcode,
      required: true,
      include: {
        model: db.BarcodeCategory,
        required: true,
      }
    },
    where: {activeFlag:true}
  })
  boxes = boxes.map(box=>{ 
    return box.toJSON()
  });
  let traces = await db.Trace.findAll({
    include: [{
      model: db.Barcode,
      required: true,
      include: {
        model: db.BarcodeCategory,
        required: true,
      }
    },{
      model: db.Part,
      required:true
    }],
    where: {activeFlag:true}
  })
  traces = traces.map(trace=>{ 
    return trace.toJSON()
  });

  locations = locations.concat(traces)

  let location_tree = {}
  for(let i=0;i<locations.length;i++) {
    if(locations[i].parentBarcodeID==0) {
      // Found Top Element
      location_tree = findChildrenBarcodes(locations,locations[i])
    }
  }
  res.json(location_tree)
}

function findChildrenBarcodes(list, item) {
  // console.log("target ID: ",barcodeID)
  item.children = []
  list.forEach(e=>{
    // console.log("parent:",e.parentBarcodeID)
    if(e.parentBarcodeID==item.barcodeID) {
      findChildrenBarcodes(list,e)
      item.children.push(e)

    }
  })
  return item;
}


exports.createNewLocation = (req, res, next) => {
  db.BarcodeCategory.findOne({
    where:{
      activeFlag:true,
      prefix:"LOC"
    }
  }).then(barcodeCategory=>{
    db.Barcode.create({
      barcodeCategoryID:barcodeCategory.dataValues.id
    }).then(barcode=>{
      db.Location.create({
        name:req.body.name,
        description: req.body.description,
        barcodeID: barcode.dataValues.id,
        parentBarcodeID: req.body.parentBarcodeID,
      }).then(location=>{
        res.json(location)
      }).catch(error=>{
        next(new RestError('Error Creating Location:'+error, 500))
      });
    }).catch(error=>{
      next(new RestError('Error Creating Barcode:'+error, 500))
    })
  }).catch(error=>{
    next(new RestError('Error Getting Barcode Category:'+error, 500))
  })
}

exports.getLocationByID = (req,res,next) => {
  db.Location.findOne({
    where: {
      id: req.params.id,
      activeFlag:true
    }
  }).then(location=>{
    res.json(location)
  }).catch(error=>{
    next(new RestError('Error Getting Location:'+error, 500))
  })
}

exports.updateLocationByID = (req,res,next) => {
  db.Location.update(req.body,{
    where: {id:req.params.id},
    returning: true
  }).then(updated=>{
    res.json(updated[1])
  }).catch(error=>{
    next(new RestError('Error Updating Location:'+error, 500))
  })
}

