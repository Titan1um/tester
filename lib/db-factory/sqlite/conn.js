const sqlite3 = require('sqlite3').verbose();
const util = require('util');

class Conn {
    constructor(cfg) {
        this.db = new sqlite3.Database(cfg.filePath);
        this.execAsync = util.promisify(this.db.all.bind(this.db));
    }

    async exec(queue) {
        if (!(queue && queue.length))
            return;

        let res = null;
        for (let item of queue) {
            res = await this.execAsync(item.sql, item.args);
        }
        return res;
    }
}

module.exports = Conn;