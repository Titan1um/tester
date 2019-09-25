const SDK = require('./sdk');
const httpSDK = require('../../net/http-sdk');
const str = require('../../str');

class User {
    constructor(project, req) {
        this.entry = {};
        this.isNull = true;
        this.req = req;
        this.route = `/${project}${req.path}`;
        this.sessionID = req.body.sessionID;
        this.sdk = new httpSDK.Class();
    }

    getTraceID() {
        if (this.req.body.traceID)
            return this.req.body.traceID;

        if (this.traceID)
            return this.traceID;

        return (this.traceID = str.randID());
    }

    setEntry(entry) {
        if (!entry)
            return;

        this.entry = entry;
        this.isNull = false;
        this.sdk = new SDK(this);
    }
}

module.exports = User;