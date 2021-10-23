const jwt = require('jsonwebtoken');
const db = require('../../../models');

async function create(req, res) {
	// const tests = await db.Test.create();
	res.status(200).send("Done");
};

module.exports = {
  create,
}