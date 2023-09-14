import { apiUtils } from '../api';

// eslint-disable-next-line no-unused-vars
export default (angie, previous, STORE) => {
	if (angie === null) {
		return null;
	}
	apiUtils.defineAngieVersion(angie.build);
	return angie;
};
