
const { dest, src, parallel, watch } = require('gulp');
const ts = require('gulp-typescript');
// const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
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

function typeCheck() {
    return src(['./src/common/**/*', './src/main/**/*'], {
        base: './src'
    })
    .pipe(tsProject());
}

function buildCommonFiles() {
    return src('./src/common/**/*')
        .pipe(sourcemaps.init())
        .pipe(babel({

        }))
        .pipe(dest('dist/common'));
}

function buildMainOutput() {
    return src(['./src/common/**/*', './src/main/**/*'], {
        base: './src'
    })
      .pipe(
        babel({
          presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env',
                {
                    targets: {
                        node: true,
                    },
                }
            ],
            [
              '@babel/preset-typescript',
              {
                isTSX: true,
                allExtensions: true,
                allowNamespaces: true,
              },
            ],
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            [
              'module-resolver',
              {
                root: ['.'],
                alias: {
                  common: './src/common',
                  renderer: './src/renderer',
                  protos: './protos',
                },
              },
            ],
          ],
        }),
      )
      .pipe(dest('dist/'));
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
    return src('./css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist/css'));
}

function buildWatch() {
    return watch('./src/**/*', parallel(scss, buildRendererPage));
}

exports.watch = buildWatch;
exports.buildCommonFiles = buildCommonFiles;
exports.buildMain = parallel(buildMainOutput, typeCheck);
exports.buildRendererPage = buildRendererPage;
exports.tsToJs = tsToJs;
exports.scss = scss;
exports.build = parallel(scss, buildMainOutput, buildRendererPage);
