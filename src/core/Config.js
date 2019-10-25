// TODO remove lodash
import defaults     from 'lodash/defaults';
import startsWith   from 'lodash/startsWith';
import endsWith     from 'lodash/endsWith';

const defaultConfig = {
    env : 'prod',
    basePath : '/',
    assetPath : '/'
};

class ConfigClass {

    initialize(bootstrapConfig = {}) {
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

        // Attempt to create setters & getters for bootstrapConfig items
        Object.keys( bootstrapConfig ).forEach( (configKey) => {
            if ( this[configKey] === undefined && this['_'+configKey] === undefined) {
                Object.defineProperty( this, configKey, {
                    get : function () {
                        return this[configKey];
                    },
                    set : function (value) {
                        this['_'+configKey] = value;
                    }
                });

                // Set initial value
                this[configKey] = bootstrapConfig[configKey];
            }
        });

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

// Instantiate Singleton
const Config = new ConfigClass();

export {Config as default, ConfigClass};
