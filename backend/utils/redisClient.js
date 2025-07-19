const Redis = require('ioredis');

const redis = new Redis({
  host: 'redis-10199.c114.us-east-1-4.ec2.redns.redis-cloud.com',
  port: 10199,
  password: 'imz61hPib8i5574BT6E2w3zVDk60823N',
});

module.exports = redis;
