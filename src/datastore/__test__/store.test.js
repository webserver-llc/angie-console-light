/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { STORE, handleDataUpdate, get } from '../store.js';

describe('Datastore Store', () => {
	it('handleDataUpdate()', () => {
		jest.spyOn(Date, 'now').mockClear().mockImplementation(() => 'date_now_test');

		const processorSpy = jest.fn(() => ({
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

		// processor fn called
		expect(processorSpy).toHaveBeenCalled();
		// processor fn call arg 1
		expect(processorSpy.mock.calls[0][0]).toBe('data_test');
		expect(processorSpy.mock.calls[0][1]).toBeNull();
		// processor fn call arg 3
		expect(processorSpy.mock.calls[0][2]).toEqual(STORE);
		// processor fn call arg 4
		expect(processorSpy.mock.calls[0][3]).toBe('timeStart_test');
		// STORE.test_1
		expect(STORE.test_1).toEqual({
			test_2: {
				handledByProcessor: true,
				lastUpdate: 'date_now_test'
			}
		});
		// Date.now called
		expect(Date.now).toHaveBeenCalled();

		handleDataUpdate(
			{
				path: ['test_1', 'test_2'],
				processors: []
			},
			null,
			'timeStart_test'
		);

		// STORE.test_1
		expect(STORE.test_1).toEqual({
			test_2: null
		});

		delete STORE.test_1;

		Date.now.mockRestore();
	});

	it('get()', () => {
		STORE.test_1 = {
			test_2: {
				test_3: 'test_3_value'
			}
		};

		const result = get([
			{ path: ['test_1', 'test_2', 'test_3'] },
			{ path: ['another_test_1', 'another_test_2'] }
		]);

		// return value
		expect(result).toEqual({
			test_3: 'test_3_value',
			another_test_2: null
		});

		delete STORE.test_1;
	});
});
