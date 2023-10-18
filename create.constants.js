/**
 * Run through the build:constants NPM script
 */
const fs = require( 'fs' );
const ngConfig = require( 'ng-config' );
const pkgConfig = require('./package.json' ).config;

const apiHost = process.env.npm_config_apihost || pkgConfig.apiHost;
const version = pkgConfig.version;
const constants = {
    appConfig: {
        version: version,
        apiHost: apiHost
    }
};

const config = ngConfig({
    constants: constants,
    module: 'poms.constants'
});

const dest = './generated-js/constants.js';
fs.writeFileSync(dest, config);

console.log("Wrote", dest);
