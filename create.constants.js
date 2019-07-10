/**
 * Run through the build:constants NPM script
 */
var fs = require( 'fs' );
var ngConfig = require( 'ng-config' );
var pkgConfig = require('./package.json' ).config;

var apiHost = process.env.npm_config_apihost || pkgConfig.apihost;
var imageApiHost = apiHost + '/images/api';
var version = pkgConfig.version;
var publisherHost = process.env.npm_config_publisherhost;
var constants = {
    appConfig: {
        version: version,
        apihost: apiHost,
        imagesapihost: imageApiHost
    }
};

var config = ngConfig({
    constants: constants,
    module: 'poms.constants'
});

fs.writeFileSync('./src/js/poms/constants.js', config);
