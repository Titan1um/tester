const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const Self = require('./index');

const content = `FROM node
ENV K1=v1 \\
    K_2={} \\
RUN node index.js`;
const fileName = 'Dockerfile';
const filePath = path.join(__dirname, fileName);

describe('lib/io/dockerfile', () => {
    before(async () => {
        await util.promisify(fs.writeFile)(filePath, content);
    });

    after(async () => {
        await util.promisify(fs.unlink)(filePath);
    });

    describe('constructor', () => {
        it('no filePath', () => {
            let err;
            try {
                new Self();
            } catch (ex) {
                err = ex;
            }
            assert.ok(err);
            assert.equal(err.message, 'filePath');
        });
    });

    describe('.getEnv()', () => {
        it('file not exists', async () => {
            let filePath = 'not exists';
            let err;
            try {
                await new Self(filePath).getEnv();
            } catch (ex) {
                err = ex;
            }
            assert.ok(err);
            assert.equal(err.message, `dockerfile: ${filePath}`);
        });

        it('ok', async () => {
            let env = await new Self(filePath).getEnv();
            assert.deepEqual(env, {
                K1: 'v1',
                'K_2': '{}'
            });
        });

        it('ok and changed', async () => {
            let self = new Self(__dirname, fileName);
            let env = await self.getEnv();
            env.temp = 100
            assert.deepEqual(
                await self.getEnv(), {
                    K1: 'v1',
                    'K_2': '{}'
                });
        });
    });
});