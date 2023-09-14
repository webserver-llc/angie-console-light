/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import AvailableApiEndpoints from '../availableApiEndpoints.js';

describe('Datastore AvailableApiEndpoints', () => {
	it('constructor()', () => {
		const instance = new AvailableApiEndpoints();

		// this.firstLevel
		expect(instance.firstLevel).toEqual([]);
		// this.secondLevel
		expect(instance.secondLevel).toEqual({
			http: [],
			stream: []
		});
	});

	it('getFirstLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.firstLevel = ['angie', 'http'];

		// return
		expect(instance.getFirstLevel()).toEqual(['angie', 'http']);
	});

	it('getSecondLevel()', () => {
		const instance = new AvailableApiEndpoints();

		// return
		expect(instance.getSecondLevel()).toEqual(['http', 'stream']);
	});

	it('getThirdLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.secondLevel.http = ['test_1', 'test_2'];

		// return
		expect(instance.getThirdLevel('http')).toEqual(['test_1', 'test_2']);
	});

	it('firstLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		instance.firstLevel = ['angie', 'upstream'];

		// check existing path
		expect(instance.firstLevelIncludes('upstream')).toBe(true);
		// check unavailable path
		expect(instance.firstLevelIncludes('test')).toBe(false);
	});

	it('fillThirdLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.fillThirdLevel('stream', { test_1: {}, test_2: {} });

		// secondLevel.stream
		expect(instance.secondLevel.stream).toEqual(['test_1', 'test_2']);
	});

	it('secondLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		// check existing path
		expect(instance.secondLevelIncludes('stream')).toBe(true);
		// check unavailable path
		expect(instance.secondLevelIncludes('test')).toBe(false);
	});

	it('thirdLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		instance.secondLevel.http = ['test_1', 'test_2'];

		// unavailable secondLevel path
		expect(instance.thirdLevelIncludes('test', 'test_1')).toBe(false);
		// unavailable thirdLevel path
		expect(instance.thirdLevelIncludes('http', 'test_3')).toBe(false);
		// available 2nd and 3rd paths
		expect(instance.thirdLevelIncludes('http', 'test_1')).toBe(true);
	});

	it('fillFirstLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.fillFirstLevel({ http: {}, stream: {} });

		// firstLevel
		expect(instance.firstLevel).toEqual(['http', 'stream']);
	});

	describe('removeEndpoint()', () => {
		let instance;

		beforeEach(() => {
			instance = new AvailableApiEndpoints();
		});

		it('remove on first level', () => {
			instance.fillFirstLevel({ angie: {} });
			instance.removeEndpoint(['angie']);
			expect(instance.getFirstLevel()).toBeArrayOfSize(0);
		});

		it('remove on third level', async () => {
			instance.fillFirstLevel({ http: {} });
			instance.fillThirdLevel('http', { server_zones: {}, location_zones: {} });
			expect(instance.getThirdLevel('http')).toBeArrayOfSize(2);
			instance.removeEndpoint(['http', 'server_zones']);
			expect(instance.firstLevelIncludes('http')).toBeTrue();
			expect(instance.getThirdLevel('http')).toBeArrayOfSize(1);
		});

		it('remove third level and first level', async () => {
			instance.fillFirstLevel({ http: {} });
			instance.fillThirdLevel('http', { server_zones: {} });
			expect(instance.getThirdLevel('http')).toBeArrayOfSize(1);
			instance.removeEndpoint(['http', 'server_zones']);
			expect(instance.firstLevelIncludes('http')).toBeFalse();
			expect(instance.getThirdLevel('http')).toBeArrayOfSize(0);
		});
	});
});
