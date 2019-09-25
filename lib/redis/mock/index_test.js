const assert = require('assert');
const $ = require('underscore');

const Self = require('./index');
const thread = require('../../thread');

describe('lib/redis/mock', () => {
    let self = new Self();

    describe('.expire(key, seconds)', () => {
        it('ok', async () => {
            let key = 'expire.ok';
            self.str[key] = {
                value: key
            };
            self.expire(key, 1);
            assert.ok(
                self.str[key].expired > new Date()
            );
        });
    });

    describe('.set(key, value, ...args)', () => {
        it('only key, value', () => {
            let key = 'set.keyAndValue';
            let res = self.set(key, key);
            assert.ok(res);
            assert.equal(
                self.str[key].value,
                key
            );
            delete self.str[key];
        });

        it('key, value, expiryMode, value', async () => {
            let key = 'set.expiryMode';
            self.set(key, key, 'ex', 1);

            assert.equal(
                self.str[key].value,
                key
            );
            assert.ok(
                self.str[key].expired > new Date()
            );

            await thread.sleep(1100);

            assert.ok(
                self.str[key].expired < new Date()
            );
            delete self.str[key];
        });

        it('key, value, nx', () => {
            let key = 'set.setMode';
            self.set(key, key, 'nx');

            let value = 'changed';
            let res = self.set(key, value, 'nx');

            assert.equal(
                self.str[key].value,
                key
            );
            delete self.str[key];
        });
    });

    describe('.hdel', () => {
        it('success', () => {
            let hash = 'hdelhash';
            let key = 'notEixts';
            let value = 1;
            self.hset(hash, key, value);
            self.hdel(hash, key);
            assert.equal(self.hash[hash][key], null);
            self.hash = {};
        });
    });

    describe('.hget', () => {
        it('not exists', () => {
            let hash = '1',
                key = 'hget.notExist';
            let res = self.hget(hash, key);
            assert.ok(!res);
        });

        it('exists', async () => {
            let hash = '2',
                key = 'hget.exists',
                value = 'exists';
            self.hash[hash] = {
                'hget.exists': value
            };
            let res = self.hget(hash, key);
            assert.equal(res, value);
            self.hash = {};
        });
    });

    describe('.hkeys', () => {
        it('not exist hash', () => {
            let hash = 'hkeyshash';
            let res = self.hkeys(hash);
            assert.deepEqual(res, []);
        });

        it('success', () => {
            let hash = 'hkeyshash';
            let data = [
                ['key1', 'value1'],
                ['key2', 'value2'],
            ];
            $.each(data, r => {
                self.hset(hash, r[0], r[1]);
            });
            let res = self.hkeys(hash);
            assert.deepEqual(res, ['key1', 'key2']);
            self.hash = {};
        });
    });

    describe('.hset', () => {
        it('not exists', async () => {
            let key = 'hset.notExist',
                hash = '3',
                value = 'not exists';
            self.hset(hash, key, value);
            assert.equal(self.hash[hash][key], value);
            self.hash = {};
        });

        it('exists', async () => {
            let hash = '4',
                key = 'hset.exists';
            self.hash[hash] = {
                'hset.exists': 'exists'
            };
            self.hset(hash, key, 'new value');
            assert.deepEqual(self.hash[hash], {
                'hset.exists': 'new value'
            });
            self.hash = {};
        });
    });

    describe('.hsetnx', () => {
        it('not exist', () => {
            let hash = 'hsetnxhash';
            let key = 'key';
            let value = 'value';
            self.hsetnx(hash, key, value);
            assert.equal(self.hash[hash][key], value);
            self.hash = {};
        });

        it('exist', () => {
            let hash = 'hsetnxhash';
            let key = 'key';
            let oldValue = 'oldValue';
            self.hset(hash, key, oldValue);
            let newValue = 'newValue';
            self.hsetnx(hash, key, newValue);
            assert.equal(self.hash[hash][key], oldValue);
            self.hash = {};
        });
    });

    describe.only('.ttl', () => {
        it('notExist', async () => {
            let key = 'ttl.notExist';
            let res = await self.ttl(key);

            assert.equal(res, -2);
        });

        it('notExpireTime', async () => {
            let key = 'ttl.notExpireTime';
            await self.set(key, 'test');

            let res = await self.ttl(key);
            delete self.str[key];

            assert.equal(res, -1);
        });

        it('ok', async () => {
            let key = 'ttl.ok';
            await self.set(key, 'test');
            await self.expire(key, 10);
            let res = await self.ttl(key);
            delete self.str[key];

            assert.ok(0 < res <= 10);
        });
    });
});