import { isEmptyObj, formatHttpResponse } from '../../utils';

export default (response) => {
	if (isEmptyObj(response)) {
		return response;
	}

	Object.keys(response).forEach((key) => {
		const { peers } = response[key];
		const result = [];
		Object.keys(peers).forEach((key) => {
			peers[key].name = key;
			peers[key].responses = formatHttpResponse(peers[key].responses);
			result.push(peers[key]);
		});
		response[key].peers = result;
	});

	return response;
};
