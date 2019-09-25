const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const Manager = require('./manager');
const io = require('../../io');

const TEST_DIR = path.join(__dirname, '..', '..', '..', 'model', 'enum');

let writeFileAsync = util.promisify(fs.writeFile);

describe('/lib/enum/file/manager', () => {
    before(async () => {
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
            path.join(TEST_DIR, 'enum-test.js'),
            tempContent
        );
    });

    after(async () => {
        let modelDir = path.join(TEST_DIR, '..');
        if (fs.readdirSync(modelDir).length)
            await io.rm(path.join(TEST_DIR, 'enum-test.js'));
        else
            await io.rm(modelDir);
    });

    describe('.all', () => {
        it('枚举存在 => 参数：enum-test', async () => {
            let enums = await new Manager('enum-test').all();
            assert.equal(enums.length, 3);
        });

        it('枚举存在 => 参数：enum-Test', async () => {
            let enums = await new Manager('enum-Test').all();
            assert.equal(enums.length, 3);
        });

        it('枚举存在 => 参数：enumtest', async () => {
            let enums = await new Manager('enumtest').all();
            assert.equal(enums.length, 3);
        });

        it('枚举存在 => 参数：enumTest', async () => {
            let enums = await new Manager('enumTest').all();
            assert.equal(enums.length, 3);
        });

        it('枚举不存在', async () => {
            let enums = await new Manager('noexist').all();
            assert.equal(enums.length, 0);
        });
    });

    describe('.has', () => {
        it('不存在', async () => {
            let exist = await new Manager('enumTest').has('notExist');
            assert.ok(!exist);
        });

        it('value是字符串', async () => {
            let exist = await new Manager('enumTest').has('running');
            assert.ok(exist);
        });

        it('value是枚举值', async () => {
            let exist = await new Manager('enumTest').has(1);
            assert.ok(exist);
        });
    });

    describe('.get', () => {
        it('value是字符串', async () => {
            let enumObj = await new Manager('enumTest').get('running');
            assert.equal(enumObj.value, 1);
        });

        it('value是枚举值', async () => {
            let enumObj = await new Manager('enumTest').get(1);
            assert.equal(enumObj.key, 'running');
        });
    });
});