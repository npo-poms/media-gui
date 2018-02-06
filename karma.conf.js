module.exports = function (config) {

  config.set({

    basePath:'',

    frameworks: ['jasmine'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-junit-reporter',
      'karma-coverage'
    ],

    files: [
      'test/unit/phantomjs-polyfill.js',

      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/lodash/index.js',

      'src/js/poms/modules/editor/*.js',
      'src/js/poms/modules/editor/**/*.js',

      'src/js/poms/modules/gtaa/*.js',
      'src/js/poms/modules/gtaa/**/*.js',

      'src/js/poms/modules/list/*.js',
      'src/js/poms/modules/list/**/*.js',

      'src/js/poms/modules/media/*.js',
      'src/js/poms/modules/media/**/*.js',

      'src/js/poms/modules/search/*.js',
      'src/js/poms/modules/search/**/*.js',

      'test/unit/modules/editor/**/*.js',
      'test/unit/modules/media/**/*.js',
      'test/unit/modules/search/**/*.js'
    ],

    exclude: [
      //'src/js/poms/app.js'
    ],

    reporters: [
      'progress',
      'coverage'
    ],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    preprocessors: {
      'src/js/poms/**/*.js': ['coverage']
    },

    port:9191,

    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    browsers:[
      'Firefox'
      //			'PhantomJS'
      //			'Chrome'
    ],

    autowatch: false,

    singleRun: true
  });
};
