
const { dest, src, parallel, watch } = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const tsProject = ts.createProject('tsconfig.json', {
    target: 'esnext',
});

const webpack = require('webpack');
 
// const source = require('vinyl-source-stream');
                
const alias = {
  common: './src/common',
  renderer: './src/renderer',
  protos: './protos',
};

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
                alias,
              },
            ],
          ],
        }),
      )
      .pipe(dest('dist/'));
}

function buildRendererPage(cb) {
  webpack(
    {
      mode: 'development',
      entry: './src/renderer/renderer.ts',
      output: {
        path: path.resolve(__dirname, 'dist/renderer'), // string
        filename: 'renderer.js', // string
        libraryTarget: 'umd', // universal module definition
      },
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            common: path.resolve(__dirname, './src/common'),
            renderer: path.resolve(__dirname, './src/renderer'),
            protos: path.resolve(__dirname, './protos'),
        },
      },
      module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.tsx?$/, loader: 'ts-loader' },
        ],
      },
      externals: [
          "electron",
      ]
    },
    (err, stats) => {
      // Stats Object
      if (err) {
        cb(err);
        return;
      }
      if (stats.hasErrors()) {
        cb(new Error(stats.toString()));
        return;
      }
      cb();
    },
  );
}

function buildWatch() {
    return watch('./src/**/*', parallel(scss, buildRendererPage));
}

exports.watch = buildWatch;
exports.buildCommonFiles = buildCommonFiles;
exports.buildMain = parallel(buildMainOutput, typeCheck);
exports.buildRendererPage = buildRendererPage;
exports.build = parallel(buildMainOutput, buildRendererPage);
