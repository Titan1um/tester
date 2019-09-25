const connectMultiparty = require('connect-multiparty');
const bodyParser = require('body-parser');
const express = require('express');

const Action = require('../cor/mvc/action');
const Auth = require('../cor/mvc/auth');
const Final = require('../cor/mvc/final');
const Invoker = require('../cor/mvc/invoker');
const Service = require('../cor/mvc/service');
const Validation = require('../cor/mvc/validation');

class Listener {
    constructor(cfg, app) {
        this.app = app || express();
        this.cfg = cfg;
    }

    listen() {
        this.setApp();
        this.setAppPlugins();
        this.registerGet('/');
        this.registerGet('/:service/:action');
        this.registerPost('/:service/:action');
        this.registerPost('/*/:service/:action');
        this.registerAll();

        this.app.listen(this.cfg.sys.port, () => console.log(`port: ${this.cfg.sys.port}`));
    }

    registerAll() {
        this.app.all('*', (_, resp) => {
            resp.json({
                err: 1,
                data: '暂不支持'
            });
        });
    }

    registerGet() {}

    registerPost(route) {
        let handler = new Service(this.cfg.dir.api);
        handler.setNext(
            new Action()
        ).setNext(
            new Auth(this.cfg.sys.name)
        ).setNext(
            new Validation()
        ).setNext(
            new Invoker()
        ).setNext(
            new Final()
        );
        this.app.post(route, (req, resp) => {
            handler.handle({
                req: req,
                resp: resp
            });
        });
    }

    setApp() {}

    setAppPlugins() {
        this.app.use(
            bodyParser.json()
        );

        this.app.use(
            connectMultiparty({
                uploadDir: this.cfg.dir.upload
            })
        );
    }
};

module.exports = Listener;