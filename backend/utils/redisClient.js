const Redis = require('ioredis');

const redis = new Redis({
  host: 'redis-12965.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 12965,
  password: '8xF5MoeFiboMlUMMz5NRiwBRAo6j6gUk',
});

module.exports = redis;
