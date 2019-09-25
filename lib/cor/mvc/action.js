const $ = require('underscore');

const Handler = require('../handler');
const Exception = require('../../os/exception');

const IGNORE_PREFIX_REG = /^\$/;

class Action extends Handler {
    handleFunc(ctx) {
        if (ctx.err)
            return;

        ctx.action = ctx.service[ctx.req.params.action.toLowerCase()];
        if (!ctx.action)
            throw new Exception(502, `server-route-action`);

        let args = getArgs(ctx.action);
        let body = $.chain(ctx.req.body).map((v, k) => [
            k.toLowerCase(),
            v
        ]).object().value();
        let files = $.chain(ctx.req.files).map((v, k) => [
            k.toLowerCase(),
            v
        ]).object().value();
        ctx.actionArg = $.chain(args).map(r => [
            r[1],
            $.has(body, r[0]) ? body[r[0]] : files[r[0]]
        ]).object().value();
    }
}

function getArgs(action) {
    if (action.args)
        return action.args;

    action.args = $.chain(action.arg).keys().map(r => [
        r.toLowerCase(),
        r.replace(IGNORE_PREFIX_REG, '')
    ]).value();
    return action.args;
}

module.exports = Action;