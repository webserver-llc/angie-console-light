## NGINX Plus Dashboard

Live activity monitoring tool for NGINX Plus.

### Build process:

Ensure you have all dependencies installed:
```
yarn install
```

To build the dashboard run:
```
yarn build
```
The result will be placed in `dist/dashboard.html`.

### Testing:

To not have tests mixed with sources all test files should be placed in related `__test__` folders in the project.

```
yarn test
```
Running the above command will start karma server and build the coverage report.

#### Tests report:

`http://0.0.0.0:9876/` – start page of karma server where your tests will run

`http://0.0.0.0:9876/debug.html` – all tests and their statuses

#### Coverage report:

In the project folder check `coverage` directory – `index.html` includes everything you need.

### Useful links:
* [Quick description](https://www.nginx.com/products/nginx/live-activity-monitoring/)
* [Guide](https://docs.nginx.com/nginx/admin-guide/monitoring/live-activity-monitoring/#using-the-dashboard)
* [Live demo](https://demo.nginx.com/)

### 3rd party modules:
* [@babel/core](https://www.npmjs.com/package/@babel/core) – 7.18.2
* [@babel/plugin-proposal-object-rest-spread](https://www.npmjs.com/package/@babel/plugin-proposal-object-rest-spread) – 7.18.0
* [@babel/plugin-transform-runtime](https://www.npmjs.com/package/@babel/plugin-transform-runtime) – 7.18.2
* [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env) – 7.18.2
* [@babel/preset-react](https://www.npmjs.com/package/@babel/preset-react) – 7.17.12
* [autoprefixer](https://www.npmjs.com/package/autoprefixer) – 10.4.0
* [babel-loader](https://github.com/babel/babel-loader) – 8.2.5
* [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) – 6.1.1
* [chai](https://www.npmjs.com/package/chai) – 4.3.4
* [core-js](https://www.npmjs.com/package/core-js) – 3.19.3
* [css-loader](https://www.npmjs.com/package/css-loader) – 6.5.1
* [cssnano](https://www.npmjs.com/package/cssnano) – 5.1.18
* [enzyme](https://www.npmjs.com/package/enzyme) – 3.11.0
* [enzyme-adapter-preact-pure](https://www.npmjs.com/package/enzyme-adapter-preact-pure) – 4.0.1
* [eslint](https://www.npmjs.com/package/eslint) – 8.4.1
* [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) – 19.0.2
* [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import) – 2.25.3
* [eslint-plugin-jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) – 6.5.1
* [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) – 7.27.1
* [eslint-webpack-plugin](https://www.npmjs.com/package/eslint-webpack-plugin) – 3.1.1
* [history](https://www.npmjs.com/package/history) – 4.10.1
* [html-inline-css-webpack-plugin](https://www.npmjs.com/package/html-inline-css-webpack-plugin) – 1.11.1
* [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) – 5.5.0
* [karma](https://github.com/karma-runner/karma) – 6.3.20
* [karma-chrome-launcher](https://www.npmjs.com/package/karma-chrome-launcher) – 3.1.0
* [karma-coverage](https://www.npmjs.com/package/karma-coverage) – 2.0.2
* [karma-coverage-istanbul-reporter](https://www.npmjs.com/package/karma-coverage-istanbul-reporter) – 3.0.3
* [karma-mocha](https://www.npmjs.com/package/karma-mocha) – 2.0.1
* [karma-sinon-chai](https://www.npmjs.com/package/karma-sinon-chai) – 2.0.2
* [karma-sourcemap-loader](https://www.npmjs.com/package/karma-sourcemap-loader) – 0.3.7
* [karma-webpack](https://www.npmjs.com/package/karma-webpack) – 5.0.0
* [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin) – 2.4.5
* [mocha](https://www.npmjs.com/package/mocha) – 10.0.0
* [npm-font-open-sans](https://github.com/dasrick/npm-font-open-sans) – 1.1.0
* [nyc](https://www.npmjs.com/package/nyc) – 15.1.0
* [postcss](https://www.npmjs.com/package/postcss) – 8.4.4
* [postcss-loader](https://www.npmjs.com/package/postcss-loader) – 6.2.1
* [postcss-url](https://github.com/postcss/postcss-url/) – 10.1.3
* [preact](https://www.npmjs.com/package/preact) – 10.7.2
* [react-dev-utils](https://www.npmjs.com/package/react-dev-utils) – 12.0.0-next.58
* [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime) – 0.13.9
* [sinon](https://www.npmjs.com/package/sinon) – 9.0.2
* [sinon-chai](https://www.npmjs.com/package/sinon-chai) – 3.7.0
* [style-loader](https://www.npmjs.com/package/style-loader) – 3.3.1
* [webpack](https://www.npmjs.com/package/webpack) – 5.65.0
* [webpack-cli](https://www.npmjs.com/package/webpack-cli) – 4.9.1
* [webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server) – 4.9.2
* [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) – 2.0.4
