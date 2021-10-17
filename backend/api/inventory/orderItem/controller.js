const db = require('../../../models');
const fetch = require('request-promise');

exports.getAllOrderItems = (req, res, next) => {
  db.OrderItem.findAll({
    where:{activeFlag:true}
  }).then(
    orderitems => {
      res.json(orderitems)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Order Items:'+error, 500))
  })
}

exports.getOrderItemsByOrderNum = (req, res, next) => {
  db.OrderItem.findAll({
    where:{
      orderNum: req.params.orderNum,
      activeFlag:true,
    },
    include: {
      model: db.Trace,
      where:{
        activeFlag:true
      },
      required:false
    }
  }).then(
    orderitems => {
      res.json(orderitems)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Order Items:'+error, 500))
  })
}

exports.pullAllOrderItems = (req, res, next) => {
  // Get a procurify Auth Token
  //TODO refactor this
  fetch('https://login.procurify.com/oauth/token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "client_id": config.procurify.nlk.clientID,
        "client_secret": config.procurify.nlk.clientSecret,
        "audience": "https://api.procurify.com/",
        "grant_type": "client_credentials"
      })
    })
    .then(response => {
      ACCESS_TOKEN = JSON.parse(response).access_token
      // Make new Order Update Row
      db.QueuedUpdate.create({
        queuedUpdateCategory:'OrderItem'
      }).then(queuedUpdate => {
        res.json(queuedUpdate)
        getOrderItemsPage(
          'https://nlk.procurify.com/api/v2/global/order_items/?page_size=50'
        ).then(res => processOrderItemResponse(res, queuedUpdate))
      }).catch(err => next(new RestError('Error Creating new update orderitem: ' + err, 500)));


    })
    .catch(err => next(new RestError('Error getting procurify token: ' + err, 500)));

  function getOrderItemsPage(url) {
    return fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'X-Procurify-Client': 'api'
      },
    }).catch(err => next(new RestError('Error getting orderitems: ' + err, 500)))
  }

  function processOrderItemResponse(response, queuedUpdate) {
    try {
      response = JSON.parse(response)
      orderitemPromiseArray = [];
      response.data.forEach(orderitem => {
        orderitemPromiseArray.push(db.OrderItem.upsert({
          orderItemID:orderitem.id,
          orderNum:orderitem.orderNum,
          name:orderitem.name,
          sku:orderitem.sku,
          vendor:orderitem.vendor,
          quantity:orderitem.quantity,
          unitPrice:orderitem.price,
          unit:orderitem.unit,
          status:orderitem.status
        }))
      })
      Promise.all(orderitemPromiseArray).then(val => {
        if (response.metadata.pagination.next) {
          console.log('OrderItems | Page done:', response.metadata.pagination.current_page, " of ", response.metadata.pagination.num_pages)
          db.QueuedUpdate.update({
            totalCount: response.metadata.pagination.count,
            completedCount: response.metadata.pagination.current_page * response.metadata.pagination.page_size,
          }, {
            where: {
              id: queuedUpdate.id
            }
          }).then(updated => {
            getOrderItemsPage(response.metadata.pagination.next)
              .then(res => processOrderItemResponse(res, queuedUpdate))
          }).catch(err => {
            failedQueuedUpdate(queuedUpdate)
            next(new RestError('Error updating orderitem update: ' + err, 500))
          })

        } else {

          db.QueuedUpdate.update({
            completed: true,
            totalCount: response.metadata.pagination.count,
            completedCount: response.metadata.pagination.count,
          }, {
            where: {
              id: queuedUpdate.id
            }
          }).then(updated => {
            console.log('All Done')
          }).catch(err => {
            failedQueuedUpdate(queuedUpdate)
            next(new RestError('Error updating completed orderitem update: ' + err, 500))
          })
        }
      }).catch(err => {
        failedQueuedUpdate(queuedUpdate)
        next(new RestError('Error upserting objects: ' + err, 500))
        
      })
    } catch (err) {
      failedQueuedUpdate(queuedUpdate)
      next(new RestError('Error processing orderitem response: ' + err, 500)) 
    }
  }

  function failedQueuedUpdate(queuedUpdate) {
    db.QueuedUpdate.update({
      completed: false,
      failed: true
    }, {
      where: {
        id: queuedUpdate.id
      }
    }).catch(err=>next(new RestError('Error updating failed orderitem update: ' + err, 500)))
  }
}
