const jwt = require('jsonwebtoken');
const db = require('../../../models');

async function logIn(req, res, next) {
  if (_.isString(req.body.username) && _.isString(req.body.password)) {
    const user = await db.User.findOne({
      where: {
        username: req.body.username,
        activeFlag: true
      }
    })
    if (_.isObject(user)) {
        if (user.authenticate(req.body.password)) {
          req.user = {
            id: user.dataValues.id,
            username: user.dataValues.username,
            displayName: user.dataValues.displayName,
          }
          req.user.token = jwt.sign(req.user, process.env.JWT_SECRET)
          res.json(req.user);
        } else {
          res.status(400).send('Username or /password is incorrect');
        }
      } else {
        res.status(400).send('Username or password is incorrect');
      }
    

  } else {
    res.status(400).send('Request is missing username or password');
  }
}

// /**
//  * @param {string} req.body.token
//  * @returns {boolean} true if the token is valid
//  */
// exports.checkToken = (req, res, next) => {
//   if (_.isString(req.headers.authorization)) {
//     jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
//       if (_.isNull(err)) {
//         res.send(true)
//       } else {
//         res.send(false)
//       }
//     })
//   } else {
//     res.send(false);
//   }
// }

// /**
//  * @returns {json} returns logged in user object
//  */
// exports.getUser = (req, res, next) => {
//   res.json(req.user);
// }

// /**
//  * @param {number} req.params.id id to update, must match token id 
//  * @returns {json} returns updated user object
//  */
// exports.updateUser = (req, res, next) => {
//   if (req.user.id == req.params.id) {
//     db.User.update(req.body, {
//       where: {
//         id: req.user.id,
//         activeFlag: true
//       },
//       individualHooks: true
//     }).then(updated => {
//       db.User.findOne({
//         attributes: ['id', 'username', 'displayName'],
//         where: {
//           id: req.user.id,
//           activeFlag: true
//         }
//       }).then(user => {
//         if (_.isNull(user)) {
//           next(new RestError('Error finding user in database', 500))
//         } else {
//           req.user = {
//             id: user.dataValues.id,
//             username: user.dataValues.username,
//             displayName: user.dataValues.displayName,
//           }
//           req.user.token = jwt.sign(req.user, process.env.JWT_SECRET)
//           res.json(req.user);
//         }
//       }).catch(error => {
//         next(new RestError('Error finding user in database. '+error, 500))
//       })
//     }).catch(error => {
//       next(new RestError('Error Updating User. ' + error, 400));
//     })
//   } else {
//     next(new RestError('Request user.id does not match token user.id', 400))
//   }
// }

module.exports = {
  logIn
}