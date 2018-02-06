/**
 * Gulp is only used for tasks that are currently easily done with NPM scripts,
 * or are done incorrectly
 */

var gulp = require( 'gulp' );
var packageInfo = require('./package.json');
var plugins = require( 'gulp-load-plugins' )();


/******************************
 * HELPERS
 ******************************/

function getCurrentVersion ( prefix ) {
    return ( typeof prefix === 'string' ? prefix : '-' )+ packageInfo.version;
}

/******************************
 * TASKS
 ******************************/

/**
 * The command line https://github.com/arnauddri/npm-html2js template cache
 * plugin uses single quotes instead of double quotes like the gulp plugin,
 * which unfortunately breaks the running app, so we stay with Gulp for now.
 */
gulp.task( 'templates', function () {

    var templateSrc = __dirname + '/src/views/';

    return gulp.src( templateSrc +'**/*.html' )
            .pipe( plugins.angularTemplatecache({ module : 'poms' }) )
            .pipe( gulp.dest( templateSrc ) );
} );

gulp.task('app-deploy', function () {

    return gulp.src( __dirname + '/src/index.html' )
        .pipe( plugins.replace( /\{version\}/g, getCurrentVersion('') ) )
        .pipe( plugins.usemin({
                vendor: [plugins.ngAnnotate(), plugins.uglify()],
                poms: [plugins.ngAnnotate(), plugins.uglify()],
                html: [plugins.minifyHtml({empty : true, spare : true, quotes : true})]
            })
        )
        .pipe( gulp.dest( __dirname + '/build/deploy/' ) );
});

gulp.task('selector-deploy', function () {

    return gulp.src( __dirname + '/src/CMSSelector/index.html' )
        .pipe( plugins.replace( /\{version\}/g, getCurrentVersion('') ) )
        .pipe( plugins.usemin({
                vendor: [plugins.ngAnnotate(), plugins.uglify()],
                poms: [plugins.ngAnnotate(), plugins.uglify()],
                html: [plugins.minifyHtml({empty : true, spare : true, quotes : true})]
            })
        )
        .pipe( gulp.dest( __dirname + '/build/deploy/CMSSelector/' ) );
});
