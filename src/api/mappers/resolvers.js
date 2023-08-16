import { isEmptyObj } from '../../utils';

export default (response) => {
	if (isEmptyObj(response)) {
		return response;
	}

	Object.keys(response).forEach((key) => {
		const { queries, responses } = response[key];

		delete response[key].queries;
		delete response[key].responses;

		response[key].requests = queries;
		response[key].responses = {};
		response[key].responses.noerror = responses.success;
		response[key].responses.formerr = responses.format_error;
		response[key].responses.servfail = responses.server_failure;
		response[key].responses.nxdomain = responses.not_found;
		response[key].responses.notimp = responses.unimplemented;
		response[key].responses.refused = responses.refused;
		response[key].responses.timedout = responses.timedout;
		response[key].responses.unknown = responses.other;
	});

	return response;
};
