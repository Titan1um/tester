const $ = require('underscore');
const fs = require('fs');
const FtpClient = require('ftp');
const path = require('path');
const util = require('util');

const mkdir = require('../../mkdir');

const PATH_REG = /\\/g;

class Ftp {
    constructor(cfg) {
        this.ftpClient = new FtpClient();
        this.ftpClient.connect(cfg);
        this.getFunc = util.promisify(this.ftpClient.get.bind(this.ftpClient));
        this.listFunc = util.promisify(this.ftpClient.list.bind(this.ftpClient));
        this.putFunc = util.promisify(this.ftpClient.put.bind(this.ftpClient));
        this.mkdirFunc = util.promisify(this.ftpClient.mkdir.bind(this.ftpClient));
    }

    close() {
        if (this.ftpClient)
            this.ftpClient.end();
    }

    async cp(src, dst) {
        if (path.basename(src).includes('.'))
            return await this.readToFile(src, dst);

        src = src.replace(PATH_REG, '/');
        let files = await this.listFunc(src);
        for (let file of files) {
            await this.cp(
                path.join(src, file.name),
                path.join(dst, file.name),
            );
        }
    }

    async readdir(dirPath) {
        dirPath = dirPath.replace(PATH_REG, '/');
        let files = await this.listFunc(dirPath);
        return $.map(files, 'name');
    }

    async readToFile(src, dst) {
        let dstDirPath = path.dirname(dst)
        await mkdir(dstDirPath);

        src = src.replace(PATH_REG, '/');
        let stream = await this.getFunc(src);
        await new Promise((resolve, reject) => {
            stream.pipe(
                fs.createWriteStream(dst)
            ).once('close', err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    async scanFiles(dirPath, action) {
        dirPath = dirPath.replace(PATH_REG, '/');
        let files = await this.listFunc(dirPath);
        for (let file of files) {
            if (file.type == 'd') {
                await this.scanFiles(
                    path.join(dirPath, file.name),
                    action
                );
            } else {
                await action(file);
            }
        }
    }

    async writeToFile(src, dst) {
        dst = dst.replace(PATH_REG, '/');
        await this.putFunc(src, dst);
    }
};

module.exports = Ftp;