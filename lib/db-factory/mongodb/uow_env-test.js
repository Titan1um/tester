const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const ConnPool = require('./conn-pool');
const Uow = require('./uow');

const dbName = "test";
const tableTrace = "trace";
const url = 'mongodb://root:123456@10.1.12.21:27017';

describe(`lib/db-factory/mongodb/uow.js`, () => {
    let connPool = new ConnPool(url, dbName);

    after(async () => {
        let client = await MongoClient.connect(url, {
            useNewUrlParser: true
        });
        dbase = client.db(dbName);
        await dbase.collection(tableTrace).deleteMany();
        await dbase.dropDatabase();
        await client.close();

        await connPool.client.close();
    });

    afterEach(async () => {
        let client = await MongoClient.connect(url, {
            useNewUrlParser: true
        });
        dbase = client.db(dbName);
        await dbase.collection(tableTrace).deleteMany();
        await client.close();
    });

    describe('.registerAdd', () => {
        it('添加不提交事务', async () => {
            let entity = {
                id: 'registerAdd_not_commit',
                desc: "xxx",
            };
            let uow = new Uow(connPool);
            uow.registerAdd(tableTrace, entity);

            let conn = await connPool.getConn();
            let count = await conn.collection(tableTrace).find().count();
            assert.equal(count, 0);
        });

        it('添加提交事务', async () => {
            let entity = {
                id: 'registerAdd_commit',
                desc: "xxx",
            };
            let uow = new Uow(connPool);
            uow.registerAdd(tableTrace, entity);
            await uow.commit();

            let conn = await connPool.getConn();
            let rows = await conn.collection(tableTrace).find().toArray();
            assert.deepEqual(rows, [entity]);
        });
    });

    describe('.registerSave', () => {
        it('更新不提交事务', async () => {
            let entity = {
                id: 'registerSave_not_commit',
                desc: "yyy",
            };
            let conn = await connPool.getConn();
            await conn.collection(tableTrace).insertOne(entity);

            let oldEntity = (await conn.collection(tableTrace).find().toArray()).shift();
            oldEntity.desc = "xxx";

            let uow = new Uow(connPool);
            uow.registerSave(tableTrace, oldEntity);

            let res = await conn.collection(tableTrace).find().toArray();
            assert.deepEqual(res, [entity]);
        });

        it('更新提交事务', async () => {
            let entity = {
                id: 'registerSave',
                desc: "yyy",
            };
            let conn = await connPool.getConn();
            await conn.collection(tableTrace).insertOne(entity);

            let uow = new Uow(connPool);
            let oldEntity = (await conn.collection(tableTrace).find().toArray()).shift();
            oldEntity.desc = "xxx";
            uow.registerSave(tableTrace, oldEntity);
            await uow.commit();

            let newEntity = (await conn.collection(tableTrace).find().toArray()).shift();
            assert.equal(newEntity.id, entity.id);
            assert.equal(newEntity.desc, "xxx");
        });
    });

    describe('.registerRemove', () => {
        it('删除不提交事务', async () => {
            let entity = {
                id: 'registerRemove_not_commit',
                desc: "yyy",
            };
            let conn = await connPool.getConn();
            await conn.collection(tableTrace).insertOne(entity);

            let uow = new Uow(connPool);
            uow.registerRemove(tableTrace, entity);
            let count = await conn.collection(tableTrace).find().count();
            assert.equal(count, 1);
        });

        it('删除提交事务', async () => {
            let entity = {
                id: 'registerRemove',
                desc: "yyy",
            };
            let conn = await connPool.getConn();
            await conn.collection(tableTrace).insertOne(entity);

            let uow = new Uow(connPool);
            let oldEntities = await conn.collection(tableTrace).find().toArray();
            uow.registerRemove(tableTrace, oldEntities[0]);
            await uow.commit();

            let count = await conn.collection(tableTrace).find().count();
            assert.equal(count, 0);
        });
    });

    describe('.commit', () => {
        it('提交0条', async () => {
            let uow = new Uow(connPool);
            await uow.commit();

            let conn = await connPool.getConn();
            let count = await conn.collection(tableTrace).find().count();
            assert.equal(count, 0);
        });

        it('提交多条', async () => {
            let entityX = {
                id: "commit_x",
                desc: "xxx"
            }
            let entityY = {
                id: "commit_y",
                desc: "yyy"
            };
            let uow = new Uow(connPool);
            uow.registerAdd(tableTrace, entityX);
            uow.registerAdd(tableTrace, entityY);
            await uow.commit();

            let conn = await connPool.getConn();
            let rows = await conn.collection(tableTrace).find().toArray();
            assert.deepEqual(rows, [entityX, entityY]);
        });
    });
});