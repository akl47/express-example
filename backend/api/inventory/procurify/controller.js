const db = require('../../../models');
const fetch = require('request-promise');
const config = require('../../../config/config.json');

async function pullAllProcurifyData(req, res, next) {
  // Get a procurify Auth Token
  const procurifyConfigs = config.procurify
  procurifyConfigs.forEach(procurifyConfig =>{
    procurifyConfig.access_token = await getProcurifyAuthToken(procurifyConfig)
    console.log("Token Done")
    res.json(procurifyConfig.access_token) 
  })
  // Get all orders
    // Create/Update Orders
  // Get all order items
    // Create/Update Order Items
}

function getProcurifyAuthToken(procurifyConfig) {
  return fetch('https://login.procurify.com/oauth/token', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "client_id": procurifyConfig.clientID,
      "client_secret": procurifyConfig.clientSecret,
      "audience": "https://api.procurify.com/",
      "grant_type": "client_credentials"
    })
  }).then(response=>{
    return JSON.parse(response).access_token 
  })
  
}

module.exports = {
  pullAllProcurifyData
}