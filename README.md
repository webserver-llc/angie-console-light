<div align="center">
    <img src="https://angie.software/en/_static/logo_black.svg" width="242", height="62">
</div>

<h1 align="center">Angie Console Light</h1>
<p align="center">Live activity monitoring tool for Angie.</p>

<h4 align="center">
  <a href="https://angie.software/en/console/#introduction">Introduction</a>
  ·
  <a href="https://angie.software/en/console/#installation-and-configuration">Installation and configuration</a>
  ·
  <a href="https://angie.software/en/console/">Documentaion</a>
  ·
  <a href="https://angie.software/en">Website</a>
  ·
</h4>

## Preview

![Angie Consoe Light](Angie-Console-Light.jpg)

## Development

Ensure you have all dependencies installed:
```
yarn install
```

To start develop the project you should run:

```bash
yarn run start-dev 
```

By default it's use https://console.angie.software as api server. Otherwise if you want use own server you should set *PROXY_TARGET* before start.

```bash
PROXY_TARGET=%YOUR_ANGIE_SERVER% yarn run start-dev
```

If you use different api prefix then `/api`, you can change for appropriate in `src/constants.js`

Open http://localhost:8082 in your browser.

### Testing

To not have tests mixed with sources all test files should be placed in related `__test__` folders in the project.

```
yarn test
```
Running the above command will Jest.

### Build

Ensure you have all dependencies installed:
```
yarn install
```

To build the project run:
```
yarn build
```
The result will be placed in `dist/console`.

### Publish on server

Put folder `dist/console` on your server and config Angie according to [guide](https://angie.software/en/console/#installation-and-configuration)
