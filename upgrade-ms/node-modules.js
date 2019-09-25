const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const cp = require('./cp');
const Handler = require('./handler');

class ReplaceNodeModules extends Handler {
    constructor(mock) {
        super();

        this.cpFunc = mock && mock.cpFunc || cp;
        this.execFunc = mock && mock.execFunc || util.promisify(childProcess.exec);
        this.existsFunc = mock && mock.existsFunc || fs.existsSync;
        this.readFileFunc = mock && mock.readFileFunc || util.promisify(fs.readFile);
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        let filePath = path.join(__dirname, '..', 'package-lock.json');
        if (this.existsFunc(filePath)) {
            console.log('对比node_modules');

            let oldContent = await this.readFileFunc(filePath);
            let oldPackages = JSON.parse(oldContent).dependencies;

            let newContent = await this.readFileFunc(path.join(ctx.gitDir, 'package-lock.json'));
            let newPackages = JSON.parse(newContent).dependencies;

            for (let item in newPackages) {
                if (!oldPackages[item] || oldPackages[item].version != newPackages[item].version) {
                    let cmd = `npm install ${item}@${newPackages[item].version}`;
                    console.log(cmd);
                    await this.execFunc(cmd);
                }
            }
        } else {
            await this.cpFunc(
                path.join(ctx.gitDir, 'package-lock.json'),
                filePath
            );
            await this.cpFunc(
                path.join(ctx.gitDir, 'node_modules'),
                path.join(__dirname, '..', 'node_modules')
            );
        }
    }
}

module.exports = ReplaceNodeModules;