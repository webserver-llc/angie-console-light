/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import utils from './factories.js';

export function buildCalculator() {
	const streamLimitConn = {
		history: {},
		prevUpdatingPeriod: null
	};

	return utils.limitConnReqFactory(streamLimitConn);
}

export default buildCalculator();
