const Clear = require('./clear');
const Clone = require('./clone');
const Copy = require('./copy');
const Replace = require('./replace');
const NodeModules = require('./node-modules');

const VERSION = '1.12.2';

let m = new Clone('https://gitlab-sz.dianchu.cc/lite/nodejs-ms-tpl.git');
m.setNext(
    new NodeModules()
).setNext(
    new Copy([
        ['api'],
        ['model', 'enum', 'err-code.js']
    ])
).setNext(
    new Replace([
        ['lib']
    ])
).setNext(
    new Clear()
);
m.handle({}).then(() => {
    console.log(`更新完成: ${VERSION}`);
});