
const { dest, src, parallel, watch } = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const webpack = require('webpack');
 
// const source = require('vinyl-source-stream');
                
const alias = {
  common: './src/common',
  renderer: './src/renderer',
  protos: './protos',
};

const babelConfig = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        },
      },
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
    [
      "search-and-replace",
      {
        "rules": [
          {
            "search": "__PACK_DIR__",
            "replace": __dirname,
          },
        ]
      }
    ],
    'babel-plugin-styled-components',
  ],
};

function buildMainOutput() {
  return src(['./src/common/**/*', './src/main/**/*'], {
    base: './src',
  })
    .pipe(babel({ ...babelConfig }))
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
          renderer: path.resolve(
            __dirname,
            './src/renderer',
          ),
          protos: path.resolve(__dirname, './protos'),
        },
      },
      module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          {
            test: /\.(tsx?|m?js)$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: { ...babelConfig },
            }
          },
          {
            test: /\.scss$/,
            use: [
                "style-loader", // 将 JS 字符串生成为 style 节点
                "css-loader", // 将 CSS 转化成 CommonJS 模块
                "sass-loader" // 将 Sass 编译成 CSS，默认使用 Node Sass
            ]
          },
          {
            test: /\.svg$/,
            use: [
              {
                loader: "babel-loader"
              },
              {
                loader: "react-svg-loader",
                options: {
                  jsx: false // true outputs JSX tags
                }
              }
            ]
          },
        ],
      },
      externals: ['electron'],
      plugins: [
          new ForkTsCheckerWebpackPlugin(),
      ],
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
  return watch('./src/**/*', parallel(buildMainOutput, buildRendererPage));
}

exports.watch = buildWatch;
exports.buildMain = buildMainOutput;
exports.buildRendererPage = buildRendererPage;
exports.build = parallel(buildMainOutput, buildRendererPage);
