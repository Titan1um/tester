const assert = require('assert');
const Ioredis = require('ioredis');

const Self = require('./index');
const thread = require('../../thread');

const cfg = {
    ip: '127.0.0.1',
    port: 6379
};

describe('lib/redis/ioredis', () => {
    let redis, self;

    before(() => {
        redis = new Ioredis(cfg.port, cfg.ip);
        self = new Self(cfg);
    });

    after(() => {
        redis.disconnect();
        self.close();
    });

    describe('.set(key, value, ..args)', () => {
        it.only('only key, value', async () => {
            let key = 'set.keyAndValue';
            await self.set(key, key);

            let value = await redis.get(key);
            await redis.del(key);

            console.log(await redis.time());

            assert.equal(key, value);
        });

        it('key, value, expiryMode, value', async () => {
            let key = 'set.expiryMode';
            await self.set(key, key, 'ex', 1);

            let value = await redis.get(key);
            assert.equal(key, value);

            await thread.sleep(1100);

            value = await redis.get(key);
            assert.ifError(value);
        });

        it('key, value, nx', async () => {
            let key = 'set.setMode';
            let res1 = await self.set(key, key, 'nx');

            let value = 'changed';
            let res2 = await self.set(key, value, 'nx');

            let redisValue = await redis.get(key);

            await redis.del(key);

            assert.equal(res1, 'OK');
            assert.equal(res2, null);
            assert.equal(redisValue, key);
        });
    });

    describe('.setnx(key, value)', () => {
        it('exists', async () => {
            let key = 'setnx.exists';
            await redis.set(key, key);

            let value = 'changed';
            let ok = await self.setnx(key, value);

            let res = await redis.get(key);
            await redis.del(key);

            assert.equal(ok, 0);
            assert.notEqual(res, value);
        });

        it('ok', async () => {
            let key = 'setnx.ok';
            let ok = await self.setnx(key, key);
            await redis.del(key);
            assert.equal(ok, 1);
        });
    });

    describe('.hdel', () => {
        it('single', async () => {
            let hash = 'hdel.single';
            let feild = 'single';
            await redis.hset(hash, feild, 'value');

            await self.hdel(hash, feild);
            let resSingle = await redis.hget(hash, feild);
            assert.ok(!resSingle);
        });

        it('mult', async () => {
            let hash = 'hdel.mult';
            let singleFeild = 'single';
            let multFeild = 'mult';
            await redis.hset(hash, multFeild, 'value');
            await redis.hset(hash, singleFeild, 'value');

            await self.hdel(hash, singleFeild, multFeild);
            let resSingle = await redis.hget(hash, singleFeild);
            let resMult = await redis.hget(hash, multFeild);
            assert.ok(!resSingle);
            assert.ok(!resMult);
        });
    });

    describe('.hkeys', () => {
        it('success', async () => {
            let hash = 'hkeys.success';
            let one = 'hkeys.one';
            let two = 'hkeys.two';
            await redis.hset(hash, two, 'value');
            await redis.hset(hash, one, 'value');

            let res = await self.hkeys(hash);
            await redis.hdel(hash, one);
            await redis.hdel(hash, two);
            assert.deepEqual(res, [two, one]);
        });
    });

    describe('.hget', () => {
        it('notExist', async () => {
            let hash = 'hget.notExist';
            let key = 'notExist';
            let res = await self.hget(hash, key);

            assert.equal(res, null);
        });

        it('exists', async () => {
            let hash = 'hget.exists';
            let key = '1';
            let value = 'exists';
            await redis.hset(hash, key, value);

            let res = await self.hget(hash, key);
            await redis.hdel(hash, key);

            assert.equal(res, value);
        });
    });

    describe('.hset', () => {
        it('notExist', async () => {
            let hash = 'hset.notExist';
            let key = '2';
            let value = 'notExist';
            await self.hset(hash, key, value);

            let res = await redis.hget(hash, key);
            await redis.hdel(hash, key);

            assert.equal(res, value);
        });

        it('exists', async () => {
            let hash = 'hset.exists';
            let key = '3';
            await redis.hset(hash, key, 'exists');
            await self.hset(hash, key, 'new value');

            let res = await redis.hget(hash, key);
            await redis.hdel(hash, key);
            assert.equal(res, 'new value');
        });
    });

    describe('.hsetnx', () => {
        it('exists', async () => {
            let hash = 'hsetnx.exists';
            let key = '4';
            await redis.hsetnx(hash, key, key);

            let value = 'changed';
            let ok = await self.hsetnx(hash, key, value);

            let res = await redis.hget(hash, key);
            await redis.hdel(hash, key);

            assert.equal(ok, 0);
            assert.notEqual(res, value);
        });

        it('ok', async () => {
            let hash = 'hsetnx.ok';
            let key = '5';
            let ok = await self.hsetnx(hash, key, key);
            await redis.hdel(hash, key);
            assert.equal(ok, 1);
        });
    });

    describe('.ttl', () => {
        it('notExist', async () => {
            let key = 'ttl.notExist';
            let res = await self.ttl(key);
            
            assert.equal(res, -2);
        });

        it('notExpireTime', async () => {
            let key = 'ttl.notExpireTime';
            await redis.set(key, 'test');

            let res = await self.ttl(key);
            await redis.del(key);

            assert.equal(res, -1);
        });

        it('ok', async () => {
            let key = 'ttl.ok';
            await redis.set(key, 'test');
            await redis.expire(key, 60);
            let res = await self.ttl(key);
            await redis.del(key);

            assert.equal(res, 60);
        });
    });
});