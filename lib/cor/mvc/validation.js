const $ = require('underscore');

const buildValidator = require('./validator');
const Handler = require('../handler');

class Validation extends Handler {
    async handleFunc(ctx) {
        if (ctx.err)
            return;

        let validators = getValidators(ctx.action);
        for (let item of validators) {
            if (!item.validator)
                continue;

            let ok = await item.validator.valid(ctx.actionArg[item.argName]);
            if (!ok)
                throw new Error(`请求参数验证不通过: ${item.argName}`);
        }
    }
}

function getValidators(action) {
    if (action.validators)
        return action.validators;

    action.validators = $.map(action.arg, (v, k) => {
        let item = {
            argName: k
        };
        if (v)
            item.validator = buildValidator(v);

        return item;
    });
    return action.validators;
}

module.exports = Validation;