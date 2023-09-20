import 'jest-canvas-mock';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import * as matchers from 'jest-extended';
import ResizeObserver from 'resize-observer-polyfill';
import { TextEncoder, TextDecoder } from 'util';
import appsettings from './src/appsettings';

localStorage.clear();
appsettings.init();

Object.assign(global, { TextDecoder, TextEncoder });
global.ResizeObserver = ResizeObserver;
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

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

expect.extend(matchers);
configure({ adapter: new Adapter() });
