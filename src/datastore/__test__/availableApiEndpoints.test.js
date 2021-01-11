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

		expect(instance.firstLevel, 'this.firstLevel').to.be.deep.equal([]);
		expect(instance.secondLevel, 'this.secondLevel').to.be.deep.equal({
			http: [],
			stream: []
		});
	});

	it('getFirstLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.firstLevel = ['nginx', 'http'];

		expect(instance.getFirstLevel(), 'return').to.be.deep.equal(
			['nginx', 'http']
		);
	});

	it('getSecondLevel()', () => {
		const instance = new AvailableApiEndpoints();

		expect(instance.getSecondLevel(), 'return').to.be.deep.equal(
			['http', 'stream']
		);
	});

	it('getThirdLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.secondLevel.http = ['test_1', 'test_2'];

		expect(instance.getThirdLevel('http'), 'return').to.be.deep.equal(
			['test_1', 'test_2']
		);
	});

	it('firstLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		instance.firstLevel = ['nginx', 'upstream'];

		expect(
			instance.firstLevelIncludes('upstream'),
			'check existing path'
		).to.be.true;
		expect(
			instance.firstLevelIncludes('test'),
			'check unavailable path'
		).to.be.false;
	});

	it('fillThirdLevel()', () => {
		const instance = new AvailableApiEndpoints();

		instance.fillThirdLevel('stream', ['test_1', 'test_2']);

		expect(instance.secondLevel.stream, 'secondLevel.stream').to.be.deep.equal(
			['test_1', 'test_2']
		);
	});

	it('secondLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		expect(
			instance.secondLevelIncludes('stream'),
			'check existing path'
		).to.be.true;
		expect(
			instance.secondLevelIncludes('test'),
			'check unavailable path'
		).to.be.false;
	});

	it('thirdLevelIncludes()', () => {
		const instance = new AvailableApiEndpoints();

		instance.secondLevel.http = ['test_1', 'test_2'];

		expect(
			instance.thirdLevelIncludes('test', 'test_1'),
			'unavailable secondLevel path'
		).to.be.false;
		expect(
			instance.thirdLevelIncludes('http', 'test_3'),
			'unavailable thirdLevel path'
		).to.be.false;
		expect(
			instance.thirdLevelIncludes('http', 'test_1'),
			'available 2nd and 3rd paths'
		).to.be.true;
	});

	it('fillFirstLevel', () => {
		const instance = new AvailableApiEndpoints();

		instance.fillFirstLevel(['http', 'stream']);

		expect(instance.firstLevel, 'firstLevel').to.be.deep.equal(
			['http', 'stream']
		);
	});
});
