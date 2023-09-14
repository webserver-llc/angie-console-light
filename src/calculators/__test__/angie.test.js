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
