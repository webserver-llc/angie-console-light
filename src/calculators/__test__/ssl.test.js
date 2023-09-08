/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import calculate from '../ssl.js';
import utils from '../utils.js';

describe('Calculators – SSL', () => {
	describe('calculate()', () => {
		const ts = 1597146438703;
		const period = 1000;
		const previous = {
			handshakes: 133,
			handshakes_failed: 3,
			session_reuses: 5,
			lastUpdate: ts - period
		};
		let ssl;

		beforeAll(() => {
			jest.spyOn(Date, 'now').mockClear().mockImplementation(() => ts);
			jest.spyOn(utils, 'calculateSpeed').mockClear().mockImplementation((a, b) => b);
		});

		beforeEach(() => {
			Date.now.mockClear();
			utils.calculateSpeed.mockClear();

			ssl = {
				handshakes: 160,
				handshakes_failed: 8,
				session_reuses: 5
			};
		});

		afterAll(() => {
			Date.now.mockRestore();
			utils.calculateSpeed.mockRestore();
		});

		it('no previous', () => {
			const result = calculate(ssl);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			// calculateSpeed called thrice
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(3);

			expect(utils.calculateSpeed.mock.calls[0][0]).toBeNull();
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(ssl.handshakes);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(ts);
			// ssl.handshakes_s
			expect(result.handshakes_s).toBe(ssl.handshakes);

			expect(utils.calculateSpeed.mock.calls[1][0]).toBeNull();
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(ssl.handshakes_failed);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(ts);
			// ssl.handshakes_failed_s
			expect(result.handshakes_failed_s).toBe(ssl.handshakes_failed);

			expect(utils.calculateSpeed.mock.calls[2][0]).toBeNull();
			// calculateSpeed 3rd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[2][1]).toBe(ssl.session_reuses);
			// calculateSpeed 3rd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[2][2]).toBe(ts);
			// ssl.session_reuses_s
			expect(result.session_reuses_s).toBe(ssl.session_reuses);

			// returned ssl
			expect(result).toEqual(ssl);
		});

		it('with previous', () => {
			const result = calculate(ssl, previous);

			// Date.now called once
			expect(Date.now).toHaveBeenCalled();
			// calculateSpeed called thrice
			expect(utils.calculateSpeed).toHaveBeenCalledTimes(3);

			// calculateSpeed 1st call 1st arg
			expect(utils.calculateSpeed.mock.calls[0][0]).toBe(previous.handshakes);
			// calculateSpeed 1st call 2nd arg
			expect(utils.calculateSpeed.mock.calls[0][1]).toBe(ssl.handshakes);
			// calculateSpeed 1st call 3rd arg
			expect(utils.calculateSpeed.mock.calls[0][2]).toBe(period);
			// ssl.handshakes_s
			expect(result.handshakes_s).toBe(ssl.handshakes);

			// calculateSpeed 2nd call 1st arg
			expect(utils.calculateSpeed.mock.calls[1][0]).toBe(previous.handshakes_failed);
			// calculateSpeed 2nd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[1][1]).toBe(ssl.handshakes_failed);
			// calculateSpeed 2nd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[1][2]).toBe(period);
			// ssl.handshakes_failed_s
			expect(result.handshakes_failed_s).toBe(ssl.handshakes_failed);

			// calculateSpeed 3rd call 1st arg
			expect(utils.calculateSpeed.mock.calls[2][0]).toBe(previous.session_reuses);
			// calculateSpeed 3rd call 2nd arg
			expect(utils.calculateSpeed.mock.calls[2][1]).toBe(ssl.session_reuses);
			// calculateSpeed 3rd call 3rd arg
			expect(utils.calculateSpeed.mock.calls[2][2]).toBe(period);
			// ssl.session_reuses_s
			expect(result.session_reuses_s).toBe(ssl.session_reuses);

			// returned ssl
			expect(result).toEqual(ssl);
		});
	});
});
