const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sqlite = require('sqlite3');
const util = require('util');

const Conn = require('./conn');

let connCfg = {
    filePath: path.join(__dirname, 'test-nodejs-ms-tpl.db')
};
let conn = new Conn(connCfg);
let db = new sqlite.Database(connCfg.filePath);

describe('/lib/db-factory/sqlite/conn.js', () => {
    before(async function () {
        db.run('CREATE TABLE model (id int,name varchar(255),password varchar(255))');
    });

    after(async function () {
        await new Promise(s => {
            conn.db.close(() => {
                s();
            });
        });
        await util.promisify(db.close.bind(db))();
        await util.promisify(fs.unlink)(connCfg.filePath);
    });

    afterEach(function () {
        db.run('DELETE FROM model');
    });

    describe('.exec', () => {
        it('错误语句', async () => {
            let err;
            try {
                await conn.exec([{
                    sql: 'SELECT_ * FROM model WHERE id > ?',
                    args: [
                        15
                    ]
                }]);
            } catch (error) {
                err = error;
            }
            assert.equal(err.code, 'SQLITE_ERROR');
        });

        it('执行单个指令', async () => {
            await conn.exec([{
                sql: 'INSERT INTO model (id,name,password) VALUES (1,\'name\',\'password\')'
            }]);
            let res = await conn.exec([{
                sql: "SELECT * FROM model WHERE id = 1",
            }]);
            assert.deepEqual(res, [{
                id: 1,
                name: 'name',
                password: 'password',
            }]);
        });

        it('执行多个指令', async () => {
            await conn.exec([{
                sql: 'INSERT INTO model (id,name,password) VALUES (1,\'111\',\'111\')'
            }, {
                sql: 'INSERT INTO model (id,name,password) VALUES (2,\'222\',\'222\')'
            }]);
            let res = await conn.exec([{
                sql: 'SELECT * FROM model'
            }]);
            assert.deepEqual(res, [{
                id: 1,
                name: '111',
                password: '111',
            }, {
                id: 2,
                name: '222',
                password: '222',
            }]);
        });
    });
});