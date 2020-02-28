import defaults from '../utils/defaults';
import endsWith from '../utils/string.endsWith';
import startsWith from '../utils/string.startsWith';

const defaultConfig = {
    env : 'prod',
    basePath : '/',
    assetPath : '/'
};

// TODO test if these are useful
class ConfigClass {

    initialize(bootstrapConfig = {}) {
        this.baseConfig = defaults( {}, bootstrapConfig, defaultConfig);

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

    // TODO id this used anywhere?
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
