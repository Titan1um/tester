const assert = require('assert');
const fs = require('fs');
const util = require('util');
const path = require('path');

const Ftp = require('./index');

const CFG = {
    host: '10.1.12.2',
    port: 21
};

let self = new Ftp(CFG);
let existAsync = util.promisify(fs.exists);
let unLinkAsync = util.promisify(fs.unlink);

describe('/lib/io/fs/ftp/index.js', () => {
    describe('.readdir', () => {
        it('list err', async () => {
            self.listFunc = path => {
                throw new Error(`${path}: No such file or directory.`);
            };
            let err;
            try {
                await self.readdir('xxx');
            } catch (error) {
                err = error;
            }
            assert.equal(err.message, 'xxx: No such file or directory.');
        });

        it('success', async () => {
            let psdNames = [{
                type: '-',
                name: 'one-0.0.0.apk'
            }, {
                type:'-',
                name: 'two-0.0.0.apk'
            }];
            self.listFunc = path => {
                resPath = path;
                return psdNames;
            };
            self.end = () => {};
            let resPath;
            let err, list;
            try {
                list = await self.readdir('MobileApp/2017001');
            } catch (error) {
                err = error;
            }

            assert.ifError(err);
            assert.deepEqual(
                list,
                ['one-0.0.0.apk', 'two-0.0.0.apk']
            );
            
            assert.equal(resPath, 'MobileApp/2017001');
        });
    });

    describe('.readToFile', () => {
        it('get err', async () => {
            self.getFunc = () => {
                throw new Error('请求失败');
            };
            let err;
            try {
                await self.readToFile('MobileApp/Lite/Android/', 'srcFilePath');
            } catch (error) {
                err = error;
            }

            assert.equal(err.message, '请求失败');
        });

        it('success', async () => {
            let resDstPath, err;
            self.getFunc = dstFilePath => {
                resDstPath = dstFilePath;
                return {
                    pipe: () => {
                        return {
                            once: (opt, fn) => {
                                if (opt == 'close')
                                    fn();
                            }
                        };
                    }
                }
            };

            try {
                await self.readToFile('MobileApp\\Lite\\Android\\', 'srcFilePath');
            } catch (error) {
                err = error;
            }

            let srcFilePath = path.join(__dirname, 'srcFilePath');
            let isExist = await existAsync(srcFilePath);
            await unLinkAsync(srcFilePath);

            assert.ifError(err);
            assert.equal(resDstPath, 'MobileApp/Lite/Android/');
            assert.ok(isExist);
        });
    });
});