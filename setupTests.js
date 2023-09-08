import 'jest-canvas-mock';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import * as matchers from 'jest-extended';
import appsettings from './src/appsettings';

localStorage.clear();
appsettings.init();

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || ((...args) => global.clearTimeout(...args));
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}

	disconnect() {
		return null;
	}

	observe() {
		return null;
	}

	takeRecords() {
		return null;
	}

	unobserve() {
		return null;
	}
};

expect.extend(matchers);
configure({ adapter: new Adapter() });
