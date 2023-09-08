## Angie Console Light 

Live activity monitoring tool for Angie.

### Build process:

Ensure you have all dependencies installed:
```
yarn install
```

To build the project run:
```
yarn build
```
The result will be placed in `dist/console.html`.

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
