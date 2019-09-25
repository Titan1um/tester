const childProcess = require('child_process');
const assert = require('assert');
const fs = require('fs');
const Ftp = require('ftp');
const path = require('path');
const util = require('util');

const self = require('./index');

const CFG = {
    host: '192.168.169.1',
    port: '21',
    user: 'user',
    password: '123456',
    keepalive: 1000
};
let localPath = path.join(__dirname, 'test');

describe('/lib/io/fs/ftp/index.js', () => {
    before(async () => {
        let ftp = new Ftp();
        ftp.connect(CFG);
        let putFunc = util.promisify(ftp.put.bind(ftp));
        let mkdirFunc = util.promisify(ftp.mkdir.bind(ftp));
        await mkdirFunc('test');
        await mkdirFunc('test/test1');
        await mkdirFunc('test/test1/test2');
        await putFunc('hello', 'test/test1/test2/test3.txt');
        ftp.end();
    });

    describe('.cp', () => {
        it('成功', async () => {
            let ftpClient = new self(CFG);
            let localPath = path.join(__dirname, 'test');
            let err;
            try {
                await ftpClient.cp('test', localPath);
            } catch (e) {
                err = e;
            }
            ftpClient.close();

            let tmpPath = localPath;
            let res = [];
            let tmp;
            while (tmp != 'test3.txt') {
                tmp = await fs.readdirSync(tmpPath);
                res.push(tmp);
                tmpPath = path.join(tmpPath, tmp.toString());
            }

            childProcess.execSync(`rmdir /s/q ${localPath}`);

            assert.ifError(err);
            assert.deepEqual(res, [
                ['test1'],
                ['test2'],
                ['test3.txt']
            ]);
        });

        it('src非法', async () => {
            let err;
            let ftpClient = new self(CFG);
            try {
                await ftpClient.cp('xxx/xxx', path.join(__dirname, 'test').replace(/\\/g, '/'));
            } catch (e) {
                err = e;
            }
            ftpClient.close();
            assert.notEqual(err, undefined);
        });
    });

    after(async () => {
        let ftp = new Ftp();
        ftp.connect(CFG);
        let rmdirFunc = util.promisify(ftp.rmdir.bind(ftp));
        let delFunc = util.promisify(ftp.delete.bind(ftp));
        await delFunc('test/test1/test2/test3.txt');
        await rmdirFunc('test/test1/test2');
        await rmdirFunc('test/test1');
        await rmdirFunc('test');
        ftp.end();
    })

});