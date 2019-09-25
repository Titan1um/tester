const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const $ = require('underscore');

const self = require('./enum');
const dbFactory = require('../lib/db-factory');
const Mysql = require('../lib/db-factory/mysql');
const io = require('../lib/io');
const redis = require('../lib/redis');
const IoRedis = require('../lib/redis/ioredis');
const str = require('../lib/str');
const errCode = require('../model/enum/err-code');

const TEST_DIR = path.join(__dirname, '..', 'model', 'enum');

let writeFileAsync = util.promisify(fs.writeFile);

const CFG = {
    host: "10.47.133.237",
    user: "root",
    password: "123456",
    port: "3306",
    database: "cp-one-config",
};

describe('/api/enum.js', () => {
    before(async () => {
        dbFactory.set(
            new Mysql(CFG)
        );
        redis.set(new IoRedis({
            ip: '10.1.12.21',
            port: 6379,
        }));

        await io.mkdir(TEST_DIR);
        let tempContent = `module.exports = {
    idle: {
        text: '空闲',
        value: 0,
    },
    running: {
        text: '执行中',
        value: 1,
    },
    completed: {
        text: '完成',
        value: 2,
    },
}`;
        await writeFileAsync(
            path.join(TEST_DIR, 'enum_test.js'),
            tempContent
        );
    });

    after(async () => {
        let modelDir = path.join(TEST_DIR, '..');
        if (fs.readdirSync(modelDir).length)
            await io.rm(path.join(TEST_DIR, 'enum_test.js'));
        else
            await io.rm(modelDir);
    });

    describe('.add', () => {
        it('枚举已存在', async () => {
            let db = dbFactory.db('enum');
            let entity = {
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 0,
                text: '测试'
            };
            await db.add(entity);

            let err;
            try {
                await self.add.fn({
                    name: 'testEnum',
                    key: 'test',
                    value: 0,
                    text: '测试'
                });
            } catch (error) {
                err = error;
            }
            await db.remove(entity);
            let count = await db.query().where('id = ?', entity.id).count();
            assert.equal(err.message, '枚举已存在');
            assert.equal(err.code, errCode.tip.value);
            assert.equal(count, 0);
            await redis.get().hset('enum', 'testEnum', Date.now());
        });

        it('success', async () => {
            let db = dbFactory.db('enum');
            let entity = {
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 0,
                text: '测试'
            };
            await db.add(entity);
            let err;
            let arg = {
                name: 'newTestAdd',
                key: 'test1',
                value: 1,
                text: '测试1',
                attrs: [{
                    enumName: 'newTestAdd',
                    enumValue: 1,
                    key: 'key',
                    value: 'value',
                }]
            }
            try {
                await self.add.fn(arg);
            } catch (error) {
                err = error;
            }

            await db.remove(entity);
            let entities = await db.query().where(
                'name = ?', arg.name
            ).toArray();
            await db.remove(entities[0]);

            let attrDb = dbFactory.db('enum-attr')
            let attrs = await attrDb.query().toArray();
            await attrDb.remove(attrs[0]);

            assert.ifError(err);
            assert.deepEqual(
                $.omit(arg, 'attrs'),
                $.omit(entities[0], 'id', 'attrs')
            );
            assert.deepEqual(
                [$.omit(attrs[0], 'id')],
                arg.attrs
            );
            await redis.get().hset('enum', entity.name, Date.now());
            await redis.get().hset('enum', arg.name, Date.now());
        });
    });

    describe('.find', () => {
        it('不存在, name有值', async () => {
            let resp = await self.find.fn({
                name: 'testEnum'
            });
            assert.deepEqual(resp, {});
            await redis.get().hset('enum', 'testEnum', Date.now());
        });

        it('不存在, names有值', async () => {
            let resp = await self.find.fn({
                names: ['testEnum']
            });
            assert.deepEqual(resp, {});
            await redis.get().hset('enum', 'testEnum', Date.now());
        });

        it('success, file', async () => {
            let resp = await self.find.fn({
                name: 'enum_test',
            });
            assert.deepEqual(resp, {
                'enum_test': [{
                        key: 'idle',
                        value: 0,
                        text: '空闲'
                    },
                    {
                        key: 'running',
                        value: 1,
                        text: '执行中'
                    },
                    {
                        key: 'completed',
                        value: 2,
                        text: '完成'
                    }
                ]
            });
        });

        it('success, db', async () => {
            let db = dbFactory.db('enum');
            let entity = {
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 1,
                text: '测试'
            };
            await db.add(entity);

            let resp = await self.find.fn({
                name: entity.name,
            });
            await db.remove(entity);
            assert.deepEqual(resp, {
                testEnum: [{
                    attr: {},
                    key: 'test',
                    text: '测试',
                    value: 1
                }]
            });
            await redis.get().hset('enum', 'testEnum', Date.now());
        });
    });

    describe('.remove', () => {
        it('success, value无值', async () => {
            let db = dbFactory.db('enum');
            let mock = [{
                id: str.randID(),
                name: 'testEnum',
                key: 'test1',
                value: 1,
                text: '测试1'
            }, {
                id: str.randID(),
                name: 'testEnum',
                key: 'test2',
                value: 2,
                text: '测试2'
            }];
            for (let entity of mock)
                await db.add(entity);

            let err;
            let arg = {
                name: mock[0].name
            };
            try {
                await self.remove.fn(arg);
            } catch (error) {
                err = error;
            }
            assert.ifError(err);
            let entities = await db.query().where('name = ?', 'testEnum').toArray();
            assert.equal(entities.length, 0);
        });

        it('success, value有值', async () => {
            let db = dbFactory.db('enum');
            let mock = [{
                id: str.randID(),
                name: 'testEnumValue',
                key: 'test1',
                value: 1,
                text: '测试1'
            }, {
                id: str.randID(),
                name: 'testEnumValue',
                key: 'test2',
                value: 2,
                text: '测试2'
            }];
            for (let entity of mock)
                await db.add(entity);

            let err;
            let arg = {
                name: mock[0].name,
                value: mock[0].value
            };
            try {
                await self.remove.fn(arg);
            } catch (error) {
                err = error;
            }
            let entities = await db.query().where('name = ?', arg.name).toArray();
            for (let entity of entities) {
                await db.remove(entity);
            }

            assert.ifError(err);
            assert.ok(entities.length == 1);
            assert.deepEqual(entities[0], mock[1]);
            await redis.get().hset('enum', arg.name, Date.now());
        });
    });
});