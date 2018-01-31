var packageConfig = require('./package.json');
var baseConfig = require( './karma.conf.js' );

module.exports = function( config ){
    baseConfig( config );

    config.set({

        browsers : [ 'PhantomJS' ],

        singleRun : true,

        autoWatch : false,

        reporters : ['progress', 'junit', 'coverage'],

        files:[
            'test/unit/phantomjs-polyfill.js',

            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',

            'build/deploy/js/vendor-'+ packageConfig.version +'.js',
            'build/deploy/js/poms-'+ packageConfig.version +'.js',

            'test/unit/modules/editor/**/*.js',
            'test/unit/modules/media/**/*.js',
            'test/unit/modules/search/**/*.js'
        ],

        junitReporter : {
            outputFile: '../../../target/surefire-reports/TEST-results.xml'
        },

        coverageReporter: {
            reporters:[{
                type: 'html',
                subdir: 'teamcity',
                dir: 'coverage/'
            }]
        }

    });
};
