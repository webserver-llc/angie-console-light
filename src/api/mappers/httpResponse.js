import { formatHttpResponse } from '../../utils';

export default (response) => {
	Object.values(response).forEach(obj => {
		if (obj.responses) {
			obj.responses = formatHttpResponse(obj.responses);
		}
	});
	return response;
};
