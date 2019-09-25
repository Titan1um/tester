const $ = require('underscore');

const httpSDK = require('../../net/http-sdk');

class SDK extends httpSDK.Class {
    constructor(user) {
        super();
        
        this.user = user;
    }

    async call(appName, route, body) {
        return await super.call(appName, route, {
            body: $.extend({}, body, {
                sessionID: this.user.sessionID,
                traceID: this.user.getTraceID(),
            }),
            query: this.user.req.query
        });
    }
}

module.exports = SDK;