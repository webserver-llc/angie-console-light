/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { limitConnReqFactory } from './utils.js';

export function buildCalculator(){
	const httpLimitConn = {
		history: {},
		prevUpdatingPeriod: null
	};

	return limitConnReqFactory(httpLimitConn);
};

export default buildCalculator();
