/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
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
