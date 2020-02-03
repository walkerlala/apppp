
# Bootstrap

## Use Chinese Mirror

```sh
$ npm config set ELECTRON_MIRROR=https://cdn.npm.taobao.org/dist/electron/
$ npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
$ npm config set sqlite3_binary_site=https://npm.taobao.org/mirrors/sqlite3/
$ npm config set node_sqlite3_binary_host_mirror=https://npm.taobao.org/mirrors
```

Install yarn and gulp

```sh
yarn
yarn global add gulp
```

Rebuild sqlite3 module (for Electron)

```sh
./node_modules/.bin/electron-rebuild
```

# Build the App

Build the complete App:

```sh
gulp build
```

Only the build renderer page:

```sh
gulp buildRendererPage
```

# Start Electron App

```sh
yarn start
```

# Hot Reload for Electron
```sh
gulp watch
```

build the complete app and reload if dist/renderer/* changed (a few seconds needed). 
