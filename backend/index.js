console.log('pre expresss')
const express = require('express');
console.log('pre app')
const app = express();
console.log('pre bp1')
const bodyParser = require("body-parser");
const port = process.env.PORT;
console.log('pre cors1')
const cors = require('cors');
console.log('pre models')
global.db = require('./models');
console.log('pre cors')
app.use(cors());
 
app.use((req,res,next) => {
	console.log(req.url);
next();
});
console.log('pre bp')
// BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: "application/vnd.api+json"}));

console.log('pre headers')
// HEADERS
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","*");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept,Authorization");
    next();
})

console.log('pre api')
app.use('/api',require('./api'))

app.listen(port, () => {
  console.log('pre sync')
  db.sequelize.sync().then(()=>{
    console.log(`Server listening on the port::${port}`);
  })
});