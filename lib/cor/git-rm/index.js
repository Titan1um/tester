const GetLoginToken = require('./get-login-token');
const GetRemoveToken = require('./get-remove-token');
const Login = require('./login');
const Remove = require('./remove');

module.exports = async ctx => {
    let handler = new GetLoginToken();
    handler.setNext(
        new Login()
    ).setNext(
        new GetRemoveToken()
    ).setNext(
        new Remove()
    );

    await handler.handle(ctx);
};