/**
 * Gulp is only used for tasks that are currently easily done with NPM scripts,
 * or are done incorrectly
 */

const gulp = require('gulp');
const packageInfo = require('./package.json');
const fs   = require('fs');
const plugins = require('gulp-load-plugins')();
const templateCache = require('gulp-angular-templatecache');


/******************************
 * HELPERS
 ******************************/

function getCurrentVersion(prefix) {
    return (typeof prefix === 'string' ? prefix : '-') + packageInfo.version;
}


function getApiHost(prefix) {
    return process.env.npm_config_apihost || "";
}

/******************************
 * TASKS
 ******************************/

/**
 * The command line https://github.com/arnauddri/npm-html2js template cache
 * plugin uses single quotes instead of double quotes like the gulp plugin,
 * which unfortunately breaks the running app, so we stay with Gulp for now.
 */
gulp.task('templates', function () {
    const templateSrc = __dirname + '/src/';
    return gulp.src(templateSrc + '**/*.html')
        .pipe(templateCache({module: 'poms'}))
        .pipe(gulp.dest(__dirname + '/src/generated-js'));
});

gulp.task('app-deploy',async function () {

    return gulp.src(__dirname + '/src/index.html')
        .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
        .pipe(plugins.replace(/\{domain}/g, getApiHost()))
        .pipe(plugins.usemin({
                vendor: [plugins.ngAnnotate(), plugins.uglify()],
                poms: [plugins.ngAnnotate(), plugins.uglify()],
                html: [plugins.minifyHtml({empty: true, spare: true, quotes: true})]
            })
        )
        .pipe(gulp.dest(__dirname + '/build/deploy/'));
});

gulp.task('app-deploy-dev', function () {

    return gulp.src(__dirname + '/src/index.html')
        .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
        .pipe(plugins.replace(/\{domain}/g, getApiHost()))
        .pipe(gulp.dest(__dirname + '/build/work/'));
});

gulp.task('selector-deploy', async function () {
    gulp.src(__dirname + '/src/CMSSelector/**/*')
        .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
        .pipe(gulp.dest(__dirname + '/build/deploy/CMSSelector/'))
        .on('end', function () {
            gulp.src(__dirname + '/src/CMSSelector/index.html')
                .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
                .pipe(plugins.usemin({
                        vendor: [plugins.ngAnnotate(), plugins.uglify()],
                        poms: [plugins.ngAnnotate(), plugins.uglify()],
                        html: [plugins.minifyHtml({empty: true, spare: true, quotes: true})]
                    })
                )
                .pipe(gulp.dest(__dirname + '/build/deploy/CMSSelector/'))
        })
});

gulp.task('head-deploy', async function () {
    gulp.src(__dirname + '/src/css/head.jspx')
        .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
        .pipe(gulp.dest(__dirname + '/build/deploy/css/'));
});


gulp.task('selector-deploy-dev', function () {

    return gulp.src(__dirname + '/src/CMSSelector/**/*')
        .pipe(plugins.replace(/\{version}/g, getCurrentVersion('')))
        .pipe(gulp.dest(__dirname + '/build/work/CMSSelector/'));
});
