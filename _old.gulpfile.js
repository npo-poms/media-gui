var gulp = require( 'gulp' );

var debug = require('debug')('poms');
var del = require('del');
var express = require( 'express' );
var karma = require( 'karma' );
var packageInfo = require('./package.json');
var pathUtil = require( 'path' );
var plugins = require( 'gulp-load-plugins' )();
var replace = require('gulp-replace');
var argv = require('yargs').argv;
var ngConstant = require('gulp-ng-constant');


/******************************
 * PATHS & GLOBALS
 ******************************/

var MODULE_NAME = 'poms';
var APIHOST_DEFAULT = '';
var SIGNON_DEFAULT = 'https://sso.omroep.nl/';
var IMAGESHOSTPATH = '/images/api/images/upload';

var BASEPATH = {
    deployBase: __dirname + '/build/deploy/',
    deploy: __dirname + '/build/deploy/',
    src: __dirname + '/src/',
    resources: __dirname + '/src/resources',
    test: __dirname + '/test/',
    target: __dirname + '/target/',
    work: __dirname + '/build/work/'
};

var PATHS = {

    index: {
        src: [ BASEPATH.src + 'index.html'],
        work: [ BASEPATH.src + 'index.html']
    },

    scripts: {
        src: BASEPATH.src +'js/'
    },

    tests: {
        unit: BASEPATH.test + 'unit/'
    },

    styles: {
        deploy: BASEPATH.deploy +'css/',
        src: BASEPATH.src +'styles/',
        srcFile: BASEPATH.src +'styles/style.scss',
        work: BASEPATH.work +'css/'

    },

    resources:{
        iconsSrc: BASEPATH.src +'resources/icons/*.svg*',
        src: BASEPATH.src +'resources/images/'
    },

    templates: {
        src: BASEPATH.src + 'views/'
    }
};


/******************************
 * HELPERS
 ******************************/

function getCurrentVersion ( prefix ) {
    return ( prefix || '-' )+ packageInfo.version;
}

function notifyLivereloadServer ( basePath, livereload, event ) {

    // `gulp.watch()` events provide an absolute path
    // so we need to make it relative to the server root
    var fileName = pathUtil.relative( basePath, event.path );

    livereload.changed( fileName );
}

function startServer ( basePath ) {

    var app = express();
    var port = process.env.PORT || 4000;

    app.use( express.static( basePath ) );
    app.listen( port );

    debug( 'express server started on localhost:%d', port );

    return app;
}

/******************************
 * BUILD & DEVELOPMENT TASKS
 ******************************/


/*
    tasks for

    -   watching -> building -> live reloading a work server
        -   unit testing
        -   building Angular sources
        -   building Angular templates
        [-  unit testing build? / e2e testing build?]
        -   building CSS
        -   post processing any other files
        -   transferring necessary assets
 */

gulp.task('config', function () {

    var apihost = APIHOST_DEFAULT ;
    var signonhost = SIGNON_DEFAULT;

    if ( argv.h ){
        apihost = argv.h;
    }

    if ( argv.s ){
        signonhost = argv.s;
    }

    var constants = {
        "appConfig" : {
            'apihost' : apihost,
            'imageshost': apihost + IMAGESHOSTPATH,
            'signonhost': signonhost
        }
    };

    return ngConstant({
        constants: constants,
        "name": "poms.constants",
        stream: true
    }).pipe( gulp.dest( PATHS.scripts.src + "poms/" ));

});

gulp.task( 'clean-app-dev', function ( cb ) {
    del([
        BASEPATH.work +'*',
        '!'+ BASEPATH.work +'{css,css/**}'
    ], cb );
} );

gulp.task( 'clean-styles-dev', function ( cb ) {
    del( PATHS.styles.work +'**', cb );
} );



gulp.task( 'app-dev', ['test-dev'], function () {

    return gulp.src( PATHS.index.src )
        .pipe( plugins.replace( /\{version\}/g, '' ) )
        .pipe( gulp.dest( BASEPATH.work ) );

} );


gulp.task( 'serve-dev', ['app-dev', 'styles-dev', 'config'], function ( cb ) {

    var app = startServer( BASEPATH.work );

    app.use( '/node_modules', express.static( './node_modules' ) );
    app.use( '/js', express.static( PATHS.scripts.src ) );
    app.use( '/views', express.static( PATHS.templates.src ) );
    app.use( '/resources', express.static( BASEPATH.resources ) );

    cb();
} );


gulp.task('styles-dev', [ 'clean-styles-dev' ], function () {

    gulp.src( PATHS.styles.src + 'vendor/**/*.css')
        .pipe(  gulp.dest( PATHS.styles.work ) );

    return gulp.src( PATHS.styles.srcFile )
        .pipe( plugins.rubySass({
            unixNewlines: true,
            precision: 4,
            noCache: true,
            trace:true
        }) )
        .on('error', function (err) { debug( err.message ); })
        .pipe( plugins.filter(['*.css']) )/* rubySass creates a sourcemap and css file, we only want the css */
        .pipe( plugins.autoprefixer({
            browsers: ['last 2 versions', '> 1%', 'ie 9'],
            cascade: true
        }) )
        .pipe( plugins.rename('poms.css') )
        .pipe( gulp.dest( PATHS.styles.work ) );
});



gulp.task( 'templates-dev', function () {

    return gulp.src( PATHS.templates.src +'**/*.html' )
            .pipe( plugins.angularTemplatecache({ module : MODULE_NAME }) )
            .pipe( gulp.dest( PATHS.templates.src ) );
} );

gulp.task( 'test-dev', ['templates-dev'], function ( cb ) {

    karma.server.start({
        configFile: __dirname + '/karma.conf.js'
    }, function (exitCode) {
        if (exitCode === 0) {
        }
        cb();
    });
} );

gulp.task( 'watch-dev', [ 'serve-dev'], function () {



    plugins.livereload.listen();

    gulp.watch( [ PATHS.index.src, PATHS.scripts.src +'/poms/**/*', PATHS.templates.src +'**/*.html', PATHS.tests.unit +'**/*' ], ['app-dev'] );

    gulp.watch( PATHS.styles.src +'**/*', ['styles-dev'] );

    gulp.watch( [BASEPATH.work + '**', PATHS.templates.src +'**/*.js'] )
        .on( 'change', notifyLivereloadServer.bind( this, BASEPATH.work, plugins.livereload ) );

} );


/******************************
 * DEPLOY TASKS
 *
 * Deploy tasks should not be run separately.
 * Run gulp deploy-poms to trigger all deploy tasks in the right order.
 *
 ******************************/

/*
    -   running unit tests?
    -   create deployment versions of the srces
        -   minified
    -   e2e testing deployment?
    -   WAR overlay creation?
 */

gulp.task('clean-deploy', function ( cb ) {
    del([
        BASEPATH.deployBase +'*'
    ], cb );
});

gulp.task('clean-target', function ( cb ) {
    del([
        BASEPATH.target +'*'
    ], cb );
});

/* there is no difference between deployment templates and dev for now */
gulp.task( 'templates-deploy', ['templates-dev'] );


gulp.task('app-deploy', ['clean-deploy', 'templates-deploy', 'config' ], function () {

    return gulp.src( PATHS.index.src )
        .pipe( plugins.replace( /\{version\}/g, getCurrentVersion() ) )
        .pipe( plugins.usemin({
                vendor: [plugins.ngAnnotate(), plugins.uglify()],
                poms: [plugins.ngAnnotate(), plugins.uglify()],
                html: [plugins.minifyHtml({empty : true, spare : true, quotes : true})]
            })
        )
        .pipe( gulp.dest( BASEPATH.deploy ) );
});


gulp.task('styles-deploy', ['clean-deploy'], function () {

    gulp.src( BASEPATH.resources +'/**/*.*' )
        .pipe( gulp.dest( BASEPATH.deploy +'/resources' ) );

    gulp.src( PATHS.styles.src + 'vendor/**/*.css')
        .pipe(  gulp.dest( PATHS.styles.deploy ) );

    return gulp.src( PATHS.styles.srcFile )
        .pipe( plugins.rubySass({ unixNewlines: true, precision: 4, noCache: true }) )
        .on('error', function (err) { debug( err.message ); })
        .pipe( plugins.filter(['*.css']) )/* rubySass creates a sourcemap and css file, we only want the css */
        .pipe( plugins.autoprefixer({
            browsers: ['last 2 versions', '> 1%', 'ie 9'],
            cascade: true
        }) )
        .pipe( plugins.rename('poms'+ getCurrentVersion() +'.css') )
        .pipe( gulp.dest( PATHS.styles.deploy ) )
        .pipe( plugins.rename({ suffix: '.min' }) )
        .pipe( plugins.minifyCss() )
        .pipe( gulp.dest( PATHS.styles.deploy ) );

});


/**
 * Having the deploy, styles and app task depend on the clean task makes sure
 * the clean task will run only once and first.
 */
gulp.task('deploy-poms', ['clean-target', 'clean-deploy', 'styles-deploy', 'app-deploy' ], function () {

    return gulp.src( BASEPATH.deploy +'**/*' )
            .pipe( plugins.war({
                welcome: 'index.html',
                displayName: 'POMS'+ getCurrentVersion('')
            }))
            .pipe( gulp.dest( BASEPATH.target ) );
});


/******************************
 * DEFAULT TASK
 ******************************/

gulp.task( 'default', ['deploy-poms'] );


