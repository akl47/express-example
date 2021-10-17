const db = require('../../../models');
const fetch = require('request-promise');

exports.getQueuedUpdatedByID = (req, res, next) => {
  db.QueuedUpdate.findOne({where:{id:req.params.id}}).then(
    queuedUpdate => {
      res.json(queuedUpdate)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Queued Update:'+error, 500))
  });
}