/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { spy, stub } from 'sinon';
import {
	STORE,
	handleDataUpdate,
	get
} from '../store.js';

describe('Datastore Store', () => {
	it('handleDataUpdate()', () => {
		stub(Date, 'now').callsFake(() => 'date_now_test');

		const processorSpy = spy(() => ({
			handledByProcessor: true
		}));

		handleDataUpdate(
			{
				path: ['test_1', 'test_2'],
				processors: [processorSpy]
			},
			'data_test',
			'timeStart_test'
		);

		expect(processorSpy.calledOnce, 'processor fn called').to.be.true;
		expect(processorSpy.args[0][0], 'processor fn call arg 1').to.be.equal('data_test');
		expect(processorSpy.args[0][1], 'processor fn call arg 2').to.be.a('null');
		expect(processorSpy.args[0][2], 'processor fn call arg 3').to.be.deep.equal(STORE);
		expect(processorSpy.args[0][3], 'processor fn call arg 4').to.be.equal('timeStart_test');
		expect(STORE.test_1, 'STORE.test_1').to.be.deep.equal({
			test_2: {
				handledByProcessor: true,
				lastUpdate: 'date_now_test'
			}
		});
		expect(Date.now.calledOnce, 'Date.now called').to.be.true;

		handleDataUpdate(
			{
				path: ['test_1', 'test_2'],
				processors: []
			},
			null,
			'timeStart_test'
		);

		expect(STORE.test_1, 'STORE.test_1').to.be.deep.equal({
			test_2: null
		});

		delete STORE.test_1;

		Date.now.restore();
	});

	it('get()', () => {
		STORE.test_1 = {
			test_2: {
				test_3: 'test_3_value'
			}
		};

		let result = get([
			{ path: ['test_1', 'test_2', 'test_3'] },
			{ path: ['another_test_1', 'another_test_2'] }
		]);

		expect(result, 'return value').to.be.deep.equal({
			test_3: 'test_3_value',
			another_test_2: null
		});

		delete STORE.test_1;
	});
});
