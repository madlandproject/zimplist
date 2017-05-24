import _ from "lodash";

const defaultConfig = {
    env : 'prod',
    basePath : '/',
    assetPath : '/'
};

class Config {

    constructor(bootstrapConfig) {

        this.baseConfig = {};

        // merge default config
        _.defaults( this.baseConfig, bootstrapConfig, defaultConfig);

        // strip first slashes on sub dir paths
        this.baseConfig.assetPath = _.startsWith(this.baseConfig.assetPath, '/') ? this.baseConfig.assetPath.substr(1) : this.baseConfig.assetPath;

        // ensure trailing slash
        this.baseConfig.basePath += (_.endsWith(this.baseConfig.basePath, '/') ? '' : '/' );
        this.baseConfig.assetPath += (_.endsWith(this.baseConfig.assetPath, '/') ? '' : '/' );

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

export default Config;