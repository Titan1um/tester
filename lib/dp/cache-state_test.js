const assert = require('assert');

const Self = require('./cache-state');
const redis = require('../redis');
const MockRedis = require('../redis/mock');
const time = require('../time');

const REDIS_NAME = 'test';
const HASH = 'hash';
const REDIS_KEY = 'dct-hash';

describe('lib/dp/cache-state.js', () => {
    before(async () => {
        redis.set(REDIS_NAME, new MockRedis());
    });

    describe('isChanged', () => {
        it('更新', async () => {
            let cacheState = new Self(HASH, 'field', REDIS_NAME);
            let t = await time.unix();
            await redis.get(REDIS_NAME).hset(REDIS_KEY, 'field', t);
            let isChanged = await cacheState.isChanged();
            await redis.get(REDIS_NAME).hdel(REDIS_KEY, 'field');

            assert.ok(isChanged);
        });

        it('无更新', async () => {
            let cacheState = new Self(HASH, 'field', REDIS_NAME);
            assert.ok(!(await cacheState.isChanged()));
        });
    });

    describe('.updateState', () => {
        it('success', async () => {
            let cacheState = new Self(HASH, 'field', REDIS_NAME);
            await cacheState.updateState();

            let value = await redis.get(REDIS_NAME).hget(REDIS_KEY, 'field');
            await redis.get(REDIS_NAME).hdel(REDIS_KEY, 'field');

            assert.ok(cacheState.modifiedOn);
            assert.equal(cacheState.modifiedOn, value);
        });
    });
});