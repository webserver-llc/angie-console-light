/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import factories from './factories.js';

export function buildCalculator() {
	const httpLimitReq = {
		history: {},
		prevUpdatingPeriod: null
	};

	return factories.limitConnReqFactory(httpLimitReq);
}

export default buildCalculator();
