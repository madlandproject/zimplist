import defaults from 'lodash/defaults';
import startsWith from 'lodash/startsWith';
import endsWith from 'lodash/endsWith';

const defaultConfig = {
    env : 'prod',
    basePath : '/',
    assetPath : '/'
};

class ConfigClass {

    constructor() {

    }

    initialize(bootstrapConfig) {
        this.baseConfig = {};

        // merge default config
        defaults( this.baseConfig, bootstrapConfig, defaultConfig);

        // strip first slashes on sub dir paths
        this.baseConfig.assetPath = startsWith(this.baseConfig.assetPath, '/') ? this.baseConfig.assetPath.substr(1) : this.baseConfig.assetPath;

        // ensure trailing slash
        this.baseConfig.basePath += (endsWith(this.baseConfig.basePath, '/') ? '' : '/' );
        this.baseConfig.assetPath += (endsWith(this.baseConfig.assetPath, '/') ? '' : '/' );

        // auto detect protocol://domain:port
        this.baseConfig.origin = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    }

    get env() {
        return this.baseConfig.env;
    }

    get assetPath() {
        return this.baseConfig.origin + this.baseConfig.basePath + this.baseConfig.assetPath;
    }

    get basePath() {
        return this.baseConfig.origin + this.baseConfig.basePath;
    }

}

const Config = new ConfigClass();

export {Config as default, ConfigClass};