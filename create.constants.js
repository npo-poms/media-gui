/**
 * Run through the build:constants NPM script
 */
var fs = require( 'fs' );
var ngConfig = require( 'ng-config' );
var pkgConfig = require('./package.json' ).config;

var apiHost = process.env.npm_config_apihost || pkgConfig.apiHost;
var imageApiHost = apiHost + '/images/api';
var version = pkgConfig.version;
var constants = {
    appConfig: {
        version: version,
        apiHost: apiHost,
        imagesApiHost: imageApiHost
    }
};

var config = ngConfig({
    constants: constants,
    module: 'poms.constants'
});

fs.writeFileSync('./src/js/poms/constants.js', config);
