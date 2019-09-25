const MongoClient = require('mongodb').MongoClient;

class ConnPool {
    constructor(url, dbName) {
        this.dbName = dbName;
        this.client = new MongoClient(url, {
            autoReconnect: true,
            poolSize: 100,
            useNewUrlParser: true
        });
    }

    async getConn() {
        if (this.conn)
            return this.conn;

        await this.client.connect();
        return (this.conn = this.client.db(this.dbName));
    }
}

module.exports = ConnPool;