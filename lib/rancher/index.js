const request = require('request');
const $ = require('underscore');

class Rancher {
    constructor(cfg, mock) {
        this.cfg = cfg;
        this.delelteFunc = mock && mock.deleteFunc || request.delete;
        this.getFunc = mock && mock.getFunc || request.get;
        this.postFunc = mock && mock.postFunc || request.post;
    }

    addService(group, project, desc, gitURL, port) {
        return new Promise((s, f) => {
            this.postFunc({
                url: `${this.cfg.url}/v2-beta/projects/${this.cfg.projectID}/service`,
                json: true,
                body: {
                    scale: 1,
                    assignServiceIpAddress: false,
                    startOnCreate: true,
                    type: 'service',
                    stackId: '1st35',
                    launchConfig: {
                        instanceTriggeredStop: 'stop',
                        kind: 'container',
                        networkMode: 'managed',
                        privileged: true,
                        publishAllPorts: false,
                        readOnly: false,
                        runInit: false,
                        startOnCreate: true,
                        stdinOpen: true,
                        tty: true,
                        vcpu: 1,
                        drainTimeoutMs: 0,
                        type: 'launchConfig',
                        labels: {
                            'dc-lite.selector.tag': `${group}-${project}`,
                            'io.rancher.container.pull_image': 'always',
                        },
                        restartPolicy: {
                            name: 'always',
                        },
                        imageUuid: gitURL.replace('https://', 'docker:')
                            .replace('gitlab', 'hub')
                            .replace('.git', ':latest'),
                        ports: `${port}:${port}/tcp`,
                    },
                    name: `${group}-${project}`,
                    description: desc,
                },
                auth: this.cfg.auth,
            }, (err, _, body) => {
                if (err)
                    f(err);
                else if (body.baseType == 'error' || body.code == 'NotUnique')
                    f(new Error('创建rancherService 失败!'));
                else
                    s();
            });
        });
    }

    addWebHook(group, project) {
        return new Promise((s, f) => {
            this.postFunc({
                url: `${this.cfg.url}/v1-webhooks/receivers?projectId=${this.cfg.projectID}`,
                json: true,
                body: {
                    type: 'receiver',
                    driver: 'serviceUpgrade',
                    serviceUpgradeConfig: {
                        addressType: 'registry',
                        batchSize: 1,
                        intervalMillis: 2,
                        payloadFormat: 'dockerhub',
                        startFirst: false,
                        type: 'serviceUpgrade',
                        tag: 'latest',
                        serviceSelector: {
                            'dc-lite.selector.tag': `${group}-${project}`,
                        },
                    },
                    name: `${group}-${project}-upgrade`,
                },
                auth: this.cfg.auth,
            }, function (err, _, body) {
                if (err)
                    f(err);
                else if (body.type == 'error')
                    f(new Error(body.message));
                else
                    s(body);
            });
        });
    }

    getService(group, project) {
        return new Promise((s, f) => {
            this.getFunc({
                url: `${this.cfg.url}/v2-beta/projects/${this.cfg.projectID}/services`,
                json: true,
                auth: this.cfg.auth,
            }, (err, _, body) => {
                if (err) {
                    f(err);
                } else if (body.type == 'error') {
                    f(new Error(body.message));
                } else {
                    s(
                        $.find(
                            body.data,
                            r => r.name == `${group}-${project}`
                        )
                    );
                }
            });
        });
    }

    getWebHook(group, project) {
        return new Promise((s, f) => {
            this.getFunc({
                url: `${this.cfg.url}/v1-webhooks/receivers?projectId=${this.cfg.projectID}`,
                json: true,
                auth: this.cfg.auth,
            }, (err, _, body) => {
                if (err) {
                    f(err);
                } else if (body.type == 'error') {
                    f(new Error(body.message));
                } else {
                    s(
                        $.find(
                            body.data,
                            r => r.name == `${group}-${project}-upgrade`
                        )
                    );
                }
            });
        });
    }

    async removeService(group, project) {
        let webServiceID = (await this.getService(group, project)).id;
        return await new Promise((s, f) => {
            this.delelteFunc({
                url: `${this.cfg.url}/v2-beta/projects/${this.cfg.projectID}/services/${webServiceID}`,
                json: true,
                auth: this.cfg.auth,
            }, err => {
                if (err)
                    return f(err);

                s(webServiceID);
            });
        });
    }

    async removeWebHook(group, project) {
        let webHookID = (await this.getWebHook(group, project)).id;
        return await new Promise((s, f) => {
            this.delelteFunc({
                url: `${this.cfg.url}/v1-webhooks/receivers/${webHookID}?projectId=${this.cfg.projectID}`,
                json: true,
                auth: this.cfg.auth,
            }, err => {
                if (err)
                    return f(err);

                s(webHookID);
            });
        });
    }
}

module.exports = Rancher;