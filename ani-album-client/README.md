
# Bootstrap

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
