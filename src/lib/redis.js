
const redis = require("redis");
const config = require('../config/env');
const {promisify} = require('util');

const clients = {};

const getAsyncClient = (client)=> {
    return {
        get: promisify(client.get).bind(client),
        mget: promisify(client.mget).bind(client),
        set: promisify(client.set).bind(client),
        mset: promisify(client.mset).bind(client),
        hset: promisify(client.hset).bind(client),
        hmset: promisify(client.hmset).bind(client),
        hget: promisify(client.hget).bind(client),
        hmget: promisify(client.hmget).bind(client),
        hgetall: promisify(client.hgetall).bind(client),
        hkeys: promisify(client.hkeys).bind(client),
        del: promisify(client.del).bind(client),
        hdel: promisify(client.hdel).bind(client),
        quit: promisify(client.quit).bind(client),
        expire: promisify(client.expire).bind(client),
        hincrby: promisify(client.hincrby).bind(client),
        flushdb: promisify(client.flushdb).bind(client),   /* BE CAREFUL */
        sadd: promisify(client.sadd).bind(client),
        zadd: promisify(client.zadd).bind(client),
        lpush: promisify(client.lpush).bind(client),
        lrange: promisify(client.lrange).bind(client),
        zrange: promisify(client.zrange).bind(client)
    };
}

Object.entries(config.APPS).map(([name, app])=> {
    if (!app.REDIS) return;
    const client = redis.createClient(app.REDIS.endpoint);
    client.auth(app.REDIS.auth);
    clients[name] = getAsyncClient(client);
});

module.exports = clients;