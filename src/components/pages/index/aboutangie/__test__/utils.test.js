import { apiUtils } from '../../../../../api';
import { docs, getHrefDocs } from '../utils';

describe('getHrefDocs()', () => {
	it('return link to oss docs', () => {
		expect(getHrefDocs()).toBe(docs.default);
	});

	it('return link to pro docs', () => {
		jest.spyOn(apiUtils, 'isAngiePro').mockClear().mockImplementation(() => true);
		expect(getHrefDocs()).toBe(docs.pro);
		apiUtils.isAngiePro.mockRestore();
	});
});
