
const redis = require('redis')
const {REDIS_OPTION} = require('../config/constant')
const client = redis.createClient(REDIS_OPTION);
module.exports = client