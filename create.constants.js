/**
 * Run through the build:constants NPM script
 */
var fs = require( 'fs' );
var ngConfig = require( 'ng-config' );
var pkgConfig = require('./package.json' ).config;

var apiHost = process.env.npm_config_apihost || pkgConfig.apihost;
var imageApiHost = apiHost + '/images/api';

var constants = {

    appConfig: {
        apihost: apiHost,
        imagesapihost: imageApiHost
    },

    LOCATIONS_API_CONFIG: {
        'API_URL': 'https://rs.vpro.nl/v3/api/',
        'API_KEY': 'vprodigitaal',
        'API_SECRET': 'tndzOIjEwhxSBO5x',
        'API_ORIGIN': 'http://www.vpro.nl',
        'API_PATH': ',uri:/v3/api/'
    }
};

var config = ngConfig({
    constants: constants,
    module: 'poms.constants'
});

fs.writeFileSync('./src/js/poms/constants.js', config);
