/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import calculate from '../angie';
import { apiUtils } from '../../api';

beforeAll(() => {
	jest.restoreAllMocks();
});

describe('Calculators - Angie', () => {
	it('return null', () => {
		expect(calculate(null)).toBeNull();
	});

	it('return data', () => {
		jest.spyOn(apiUtils, 'defineAngieVersion').mockImplementation(() => {});
		expect(calculate({ build: 'PRO' })).toBeObject();
		expect(apiUtils.defineAngieVersion).toHaveBeenCalledWith('PRO');
	});
});
