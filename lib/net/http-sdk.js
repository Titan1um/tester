const request = require('request');

const Exception = require('../os/exception');

let appNameOfURL = {};

class SDK {
    async call(appName, route, opts) {
        if (opts && !opts.body) {
            opts = {
                body: opts
            };
        }

        let url = await this.getURL(appName, opts);
        return new Promise((s, f) => {
            request.post({
                body: opts.body,
                json: true,
                qs: opts.query,
                url: url + route
            }, (err, _, body) => {
                if (err)
                    f(err);
                else if (body.err)
                    f(new Exception(body.err, body.data));
                else
                    s(body.data);
            });
        });
    }

    getURL(appName, opts) {
        return new Promise((s, f) => {
            if (appNameOfURL[appName])
                return s(appNameOfURL[appName]);

            request.post({
                body: {
                    name: appName
                },
                json: true,
                qs: opts.query,
                url: `${appNameOfURL.sc}/ms/get-url`
            }, (err, _, body) => {
                if (err) {
                    f(err);
                } else if (body.err) {
                    f(new Exception(body.err, body.data));
                } else {
                    appNameOfURL[appName] = body.data;
                    s(body.data);
                }
            });
        });
    }
}

exports.Class = SDK;

exports.init = url => appNameOfURL.sc = url;