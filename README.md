# Denada
## Development
- Node `v8.3.0`
- Electron `v3.x`

> On Windows you will also have to install `windows-build-tools` so that electron-rebuild or node-sass do not fail
> when attempting to call python. Run the following in Powershell as an Administrator:
>
> `$ npm --add-python-to-path install --global --production windows-build-tools`
>
> NOTE: Ensure that python is in your path before continuing.

```console
$ npm install
$ npm run start:dev
```

## A note on camo
Camo has an [active issue](https://github.com/scottwrobinson/camo/issues/111#issuecomment-374698154) open that is not honoring optional installations, Until that is fixed we have to install mongodb as well...

