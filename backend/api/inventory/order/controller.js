const db = require('../../../models');
const fetch = require('request-promise');

exports.getAllOrders = (req, res, next) => {
  db.Order.findAll({
    order: [
      ['date', 'DESC']
    ]
  }).then(
    orders => {
      res.json(orders)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Orders:'+error, 500))
  })
}
exports.getOrdersByUserID = (req, res, next) => {
  db.Order.findAll({
    order: [
      ['date', 'DESC']
    ],
    where: {
      procurifyUserID: req.params.userID,
      // orderNum: 7265
    }
  }).then(
    orders => {
      res.json(orders)
    }
  ).catch(error=>{
    next(new RestError('Error Getting Orders by UserID:'+error, 500))
  })
}

exports.pullAllOrders = (req, res, next) => {
  // Get a procurify Auth Token
  // TODO refactor this
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
      // console.log("got token")
      ACCESS_TOKEN = JSON.parse(response).access_token
      // Make new Order Update Row
      // console.log("creating queued update")
      db.QueuedUpdate.create({
        queuedUpdateCategory:'Order'
      }).then(queuedUpdate => {
        // console.log("queued update created")
        res.json(queuedUpdate)
        getOrdersPage(
          'https://nlk.procurify.com/api/v2/global/orders/?page_size=50'
        ).then(res => processOrderResponse(res, queuedUpdate))
      }).catch(err => next(new RestError('Error Creating new update order: ' + err, 500)));


    })
    .catch(err => next(new RestError('Error getting procurify token: ' + err, 500)));

  function getOrdersPage(url) {
    // console.log("Getting Orders Page")
    return fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'X-Procurify-Client': 'api'
      },
    }).catch(err => next(new RestError('Error getting orders: ' + err, 500)))
  }

  function processOrderResponse(response, queuedUpdate) {
    // console.log("Processing Orders")
    try {
      response = JSON.parse(response)
      // console.log(response)
      orderPromiseArray = [];
      response.data.forEach(order => {
        orderPromiseArray.push(db.Order.upsert({
          orderNum: order.num,
          uuid: order.uuid,
          description: order.description,
          date: order.date,
          status: order.status,
          procurifyUserID: order.user.id,
          itemCount: order.item_count,
          totalPrice: parseInt(order.total_cost_in_base_currency).toFixed(2)
        }))
      })
      Promise.all(orderPromiseArray).then(val => {
        if (response.metadata.pagination.next) {
          console.log('Orders | Page done:', response.metadata.pagination.current_page, " of ", response.metadata.pagination.num_pages)
          db.QueuedUpdate.update({
            totalCount: response.metadata.pagination.count,
            completedCount: response.metadata.pagination.current_page * response.metadata.pagination.page_size,
          }, {
            where: {
              id: queuedUpdate.id
            }
          }).then(updated => {
            getOrdersPage(response.metadata.pagination.next)
              .then(res => processOrderResponse(res, queuedUpdate))
          }).catch(err => {
            console.log(err)
            failedQueuedUpdate(queuedUpdate)
            next(new RestError('Error updating order update: ' + err, 500))
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
            console.log(err)
            failedQueuedUpdate(queuedUpdate)
            next(new RestError('Error updating completed order update: ' + err, 500))
          })
        }
      }).catch(err => {
        console.log(err)
        failedQueuedUpdate(queuedUpdate)
        next(new RestError('Error upserting objects: ' + err, 500))
        
      })
    } catch (err) {
      console.log(err)
      failedQueuedUpdate(queuedUpdate)
      next(new RestError('Error processing order response: ' + err, 500))
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
    }).catch(err=>next(new RestError('Error updating failed order update: ' + err, 500)))
  }
}
