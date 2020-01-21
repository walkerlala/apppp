
const { dest, src, parallel, watch } = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json', {
    target: 'esnext',
});
const sass = require('gulp-sass');
 
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');

function tsToJs() {
    return tsProject
        .src()
        .pipe(tsProject())
        .js.
        pipe(dest('dist'));
}

// function build() {
//     return tsProject
//         .src()
//         .pipe(tsProject())
//         .js.
//         pipe(dest('dist'));
// }

function buildMainPage() {
    return src(['./src/main/**/*'])
        .pipe(tsProject())
        .js.
        pipe(dest('dist/main'));
}

function buildRendererPage() {
    return browserify({
        // basedir: './src',
        debug: true,
        entries: ['src/renderer/renderer.ts'],
        paths: ['./src'],
        cache: {},
        packageCache: {},
    })
    // .require('./src/renderer', { expose: 'renderer' })
    .plugin(tsify)
    .bundle()
    .pipe(source('renderer.js'))
    .pipe(dest('dist/renderer'));
}

function scss() {
    return src('./src/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist/css'));
}

function buildWatch() {
    return watch('./src/**/*', parallel(scss, buildRendererPage));
}

exports.watch = buildWatch;
exports.buildMainPage = buildMainPage;
exports.buildRendererPage = buildRendererPage;
exports.tsToJs = tsToJs;
exports.scss = scss;
exports.build = parallel(scss, buildMainPage, buildRendererPage);
