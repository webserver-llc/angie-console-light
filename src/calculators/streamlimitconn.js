/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { limitConnReqFactory } from './factories.js';

export function buildCalculator(){
	const streamLimitConn = {
		history: {},
		prevUpdatingPeriod: null
	};

	return limitConnReqFactory(streamLimitConn);
};

export default buildCalculator();
