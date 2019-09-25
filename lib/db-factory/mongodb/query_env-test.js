const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const ConnPool = require('./conn-pool');
const Query = require('./query');

const dbName = "testDB";
const tableLog = "log";
const tableTrace = "trace";
const url = 'mongodb://root:123456@10.1.12.21:27017';

let baidu = {
    id: 3,
    name: 'Baidu',
    url: 'http://baidu.com',
    type: 'cn',
    tag: 0,
};
let facebook = {
    id: 1,
    name: 'Facebook',
    url: 'https://www.facebook.com',
    type: 'en',
    tag: 1,
};
let douban = {
    id: 2,
    name: 'Douban',
    url: 'https://www.douban.com',
    type: 'en',
    tag: 2,
};

describe(`lib/db-factory/mongodb/query.js`, () => {
    let connPool = new ConnPool(url, dbName);
    after(async () => {
        let client = await MongoClient.connect(url, {
            useNewUrlParser: true
        });
        let conn = client.db(dbName);
        await conn.collection(tableTrace).deleteMany();
        await conn.dropDatabase();
        await client.close();
        await connPool.client.close();
    });

    before(async () => {
        let client = await MongoClient.connect(url, {
            useNewUrlParser: true
        });
        var myobjs = [facebook, douban, baidu];
        await client.db(dbName).collection(tableTrace).insertMany(myobjs);
        await client.close();
    });

    describe('.count', () => {
        it('无数据', async () => {
            let count = await new Query(connPool, tableLog).count();
            assert.equal(count, 0);
        });

        it('有数据', async () => {
            let count = await new Query(connPool, tableTrace).count();
            assert.equal(count, 3);
        });

        it('有数据且有条件', async () => {
            let count = await new Query(connPool, tableTrace).where({
                name: 'Baidu'
            }).count();
            assert.equal(count, 1);
        });
    });

    describe('.order', () => {
        it('单个正序', async () => {
            let rows = await new Query(connPool, tableTrace).order('id').toArray();
            assert.deepEqual(rows, [facebook, douban, baidu]);
        });

        it('多个正序', async () => {
            let rows = await new Query(connPool, tableTrace).order('type', 'id').toArray();
            assert.deepEqual(rows, [baidu, facebook, douban]);
        });

        it('正序加倒序', async () => {
            let rows = await new Query(connPool, tableTrace).order('type').orderByDesc('tag').toArray();
            assert.deepEqual(rows, [baidu, douban, facebook]);
        });
    });

    describe('.orderByDesc', () => {
        it('单个倒序', async () => {
            let rows = await new Query(connPool, tableTrace).orderByDesc('id').toArray();
            assert.deepEqual(rows, [baidu, douban, facebook]);
        });

        it('多个倒序', async () => {
            let rows = await new Query(connPool, tableTrace).orderByDesc('type', 'id').toArray();
            assert.deepEqual(rows, [douban, facebook, baidu]);
        });

        it('倒序加正序', async () => {
            let rows = await new Query(connPool, tableTrace).orderByDesc('type').order('name').toArray();
            assert.deepEqual(rows, [douban, facebook, baidu]);
        });
    });

    describe('.skip', () => {
        it('跳过N个', async () => {
            let rows = await new Query(connPool, tableTrace).skip(1).toArray();
            assert.equal(rows.length, 2);
        });
    });

    describe('.take', () => {
        it('取前N个', async () => {
            let rows = await new Query(connPool, tableTrace).take(1).toArray();
            assert.equal(rows.length, 1);
        });
    });

    describe('.toArray', function () {
        it('转换成数组', async () => {
            let rows = await new Query(connPool, tableTrace).toArray();
            assert.deepEqual(rows, [facebook, douban, baidu]);
        });

        it('有条件、转换成数组', async () => {
            let rows = await new Query(connPool, tableTrace).where({
                "name": 'Baidu'
            }).toArray();
            assert.deepEqual(rows, [baidu]);
        });

        it('跳过、转换成数组', async () => {
            let rows = await new Query(connPool, tableTrace).skip(1).toArray();
            assert.deepEqual(rows, [douban, baidu]);
        });

        it('取前N个、转换成数组', async () => {
            let rows = await new Query(connPool, tableTrace).take(1).toArray();
            assert.deepEqual(rows, [facebook]);
        });

        it('跳过、取前N个、有条件、转换成数组', async () => {
            let rows = await new Query(connPool, tableTrace).where({
                "type": "en"
            }).skip(1).take(1).toArray();
            assert.deepEqual(rows, [douban]);
        });
    });

    describe('.where', function () {
        it('没有条件', async () => {
            let count = await new Query(connPool, tableTrace).where().count();
            assert.equal(count, 3);
        });

        it('按条件查询', async () => {
            let rows = await new Query(connPool, tableTrace).where({
                name: 'Baidu'
            }).toArray();
            assert.deepEqual(rows, [baidu]);
        });
    });
});