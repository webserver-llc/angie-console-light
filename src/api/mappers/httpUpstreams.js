import { isEmptyObj, formatHttpResponse } from '../../utils';

export default (response) => {
	if (isEmptyObj(response)) {
		return response;
	}

	Object.keys(response).forEach((key) => {
		const { peers } = response[key];
		const result = [];
		Object.keys(peers).forEach((key, index) => {
			const {
				data: { sent, received },
				selected: { current, total, last },
				health: { fails, unavailable, downtime, downstart },
			} = peers[key];
			peers[key].id = index;
			peers[key].name = key;
			peers[key].responses = formatHttpResponse(peers[key].responses);
			peers[key].active = current;
			peers[key].requests = total;
			peers[key].selected = last;
			peers[key].unavail = unavailable;
			peers[key].fails = fails;
			peers[key].downtime = downtime;
			peers[key].downstart = downstart;
			peers[key].sent = sent;
			peers[key].received = received;

			delete peers[key].health;
			delete peers[key].data;

			// TODO: Implements on Angie PRO 1.2.0 version
			peers[key].health_checks = {};
			result.push(peers[key]);
		});
		response[key].peers = result;
	});
	console.log(response);

	return response;
};
