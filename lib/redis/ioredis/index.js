const Ioredis = require('ioredis');
const $ = require('underscore');

class Redis {
    constructor(cfg) {
        this.client = $.isArray(cfg) ? new Ioredis.Cluster(cfg) : new Ioredis(cfg.port, cfg.ip);
    }

    close() {
        this.client.disconnect();
    }

    async del(key) {
        await this.client.del(key);
    }

    async expire(key, seconds) {
        await this.client.expire(key, seconds);
    }

    async get(key) {
        return await this.client.get(key);
    }

    async hdel(hash, ...f) {
        return await this.client.hdel(hash, f);
    }

    async hget(hash, f) {
        return await this.client.hget(hash, f);
    }

    async hkeys(hash) {
        return await this.client.hkeys(hash);
    }

    async hset(hash, f, v) {
        await this.client.hset(hash, f, v);
    }

    async hsetnx(hash, f, v) {
        return await this.client.hsetnx(hash, f, v);
    }

    async pexpire(key, milliseconds) {
        await this.client.pexpire(key, milliseconds);
    }

    async set(key, value, ...args) {
        return await this.client.set(key, value, ...args);
    }

    async setex(key, seconds, value) {
        return await this.client.setex(key, seconds, value)
    }

    async setnx(key, value) {
        return await this.client.setnx(key, value);
    }

    async time() {
        return await this.client.time();
    }

    async ttl(key) {
        return await this.client.ttl(key);
    }
}

module.exports = Redis;