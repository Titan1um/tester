const DockerFile = require('../docker-file');

let cache = {};

exports.getEnv = key => {
    return cache[key] || process.env[key];
};

exports.getEnvWithThrow = key => {
    let value = this.getEnv(key);
    if (!value)
        throw new Error(`无效的环境变量:${key}`);

    return value;
};

exports.init = async () => {
    let file = new DockerFile(__dirname, '..', '..', 'Dockerfile');
    cache = await file.getEnv();
};

exports.mock = (key, value) => {
    cache[key] = value;
};