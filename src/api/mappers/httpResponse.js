import { formatHttpResponse } from '../../utils';

export default (response) => {
	Object.values(response).forEach(obj => {
		const { requests: { total, processing, discarded } } = obj;
		if (obj.responses) {
			obj.responses = formatHttpResponse(obj.responses);
		}
		obj.requests = total;
		obj.processing = processing;
		obj.discarded = discarded;
	});
	return response;
};
