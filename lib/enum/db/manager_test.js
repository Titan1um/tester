const assert = require('assert');
const $ = require('underscore');

const Manager = require('./manager');
const dbFactory = require('../../db-factory');
const mock = require('../../db-factory/mock');
const redis = require('../../redis');
const mockRedis = require('../../redis/mock');
const time = require('../../time');

let gold = {
    name: 'metal',
    key: 'Gold',
    value: 3,
    text: '金',
};
let iron = {
    id: '1',
    name: 'metal',
    key: 'iron',
    value: 1,
    text: '铁',
};
let name = 'metal';
let silver = {
    id: '2',
    name: 'metal',
    key: 'silver',
    value: 2,
    text: '银A',
};

describe('/lib/enum/db/manager.js', () => {
    before(() => {
        dbFactory.set(new mock.Factory());
        redis.set(new mockRedis());
        mock.RegisterWhere('enum-attr', (entity, where) => {
            return entity.enumName == where[1];
        });
    });

    beforeEach(async () => {
        mock.RegisterWhere('enum', (entity, where) => {
            return entity.name == where[1];
        });
        let db = dbFactory.db('enum');
        await db.add(iron);
        await db.add(silver);
    });

    afterEach(() => {
        mock.flushAll();
    });

    describe('.add', () => {
        it('枚举已存在', async () => {
            let self = new Manager('metal', () => {
                return true;
            });
            await self.add(null, silver);

            assert.notEqual(self.modifiedOn, 0);
            assert.equal(self.items.length, 2);
        });

        it('枚举不存在', async () => {
            let self = new Manager(name, () => {
                return false;
            });
            await self.add(null, gold);
            assert.ifError(self.items);
        });

        it('success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            await self.add(null, gold);
            let res = self.items.pop().entry;
            assert.deepEqual(res, {
                ...gold,
                id: res.id,
                attrs: []
            });
        });
    });

    describe('.has', () => {
        it('无数据', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let res = await self.has('SLIVER');
            assert.ok(!res);
        });

        it('根据key查询+success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let ok = await self.has(silver.key);
            assert.ok(ok);
        });

        it('根据value查询+success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let ok = await self.has(silver.value);
            assert.ok(ok);
        });

        it('根据text查询+success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let ok = await self.has(silver.text);
            assert.ok(ok);
        });

        it('有缓存 且缓存时间大于redis时间', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            await self.has(silver.value);
            await redis.get().hset(
                'dct-enum',
                'metal',
                await time.unix() - 10
            );

            //第二次取有缓存
            let hasExec = null;
            mock.RegisterWhere('enum', () => {
                hasExec = true;
            });
            await self.has(silver.value);
            assert.ifError(hasExec);
        });

        it('有缓存 且redis时间大于缓存时间', async () => {
            let self = new Manager('metal', () => {
                return true;
            });
            await self.has('metal');
            await redis.get().hset(
                'dct-enum',
                'metal',
                await time.unix() + 10
            );

            let hasExec = false;
            mock.RegisterWhere('enum', () => {
                hasExec = true;
            });
            await self.has(silver.value);
            assert.ok(hasExec);
        });
    });

    describe('.get', () => {
        it('无数据', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let res = await self.get('SLIVER');
            assert.ok(!res);
        });

        it('根据key查询+success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let res = await self.get(silver.key);
            let expect = {
                ...$.pick(silver, 'key', 'value', 'text'),
                attr: {}
            };
            assert.deepEqual(res, expect);
        });

        it('根据value查询+success', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let res = await self.get(silver.value);
            let expect = {
                ...$.pick(silver, 'key', 'value', 'text'),
                attr: {}
            };
            assert.deepEqual(res, expect);
        });

        it('根据text查询+success+有attrs', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            let res = await self.get(silver.text);
            let expect = {
                ...$.pick(silver, 'key', 'value', 'text'),
                attr: {}
            };
            assert.deepEqual(res, expect);
        });
    });

    describe('.remove', () => {
        it('item不存在', async () => {
            let self = new Manager(name, () => {
                return true;
            });
            self.items = [{
                entry: iron
            }];
            await self.remove(null, 'not.exist');
            assert.ok(self.items.length);
        });

        it('success', async () => {
            await dbFactory.db('enum').add(gold);

            let self = new Manager(name, () => {
                return true;
            });
            self.items = [iron, silver, gold];
            await self.remove(null, silver.key);

            let rows = await dbFactory.db('enum').query().toArray();
            assert.deepEqual(rows, [iron, gold]);
        });
    });
});