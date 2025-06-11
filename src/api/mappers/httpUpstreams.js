/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { isEmptyObj, formatHttpResponse } from '../../utils';

export default (response) => {
	if (isEmptyObj(response)) {
		return response;
	}

	Object.keys(response).forEach((key) => {
		const { peers } = response[key];
		const result = [];
		Object.keys(peers).forEach((key) => {
			const {
				state,
				data: { sent, received },
				selected: { current, total, last },
				health: {
					fails,
					unavailable,
					downtime,
					downstart,
					probes,
					header_time,
					response_time,
					connect_time,
					first_byte_time,
					last_byte_time,
				},
			} = peers[key];
			peers[key].id = key;
			peers[key].name = key;
			if (peers[key].responses) {
				peers[key].responses = formatHttpResponse(peers[key].responses);
			}
			peers[key].active = current;
			peers[key].requests = total;
			peers[key].selected = last;
			peers[key].unavail = unavailable;
			peers[key].fails = fails;
			peers[key].downtime = downtime;
			peers[key].downstart = downstart;
			peers[key].sent = sent;
			peers[key].received = received;

			if (peers[key].state === 'unavailable') {
				peers[key].state = 'unavail';
			}

			delete peers[key].health;
			delete peers[key].data;

			peers[key].health_checks = {};
			if (probes) {
				peers[key].health_checks = {
					checks: probes.count,
					fails: probes.fails,
					last: probes.last,
					last_passed: state !== 'unhealthy',
				};
			}

			peers[key].response_time = {};
			const timingData = { header_time, response_time, connect_time, first_byte_time, last_byte_time };

			if (Object.values(timingData).some(Boolean)) {
				peers[key].response_time = timingData;
			}

			result.push(peers[key]);
		});
		response[key].peers = result;
	});

	return response;
};
