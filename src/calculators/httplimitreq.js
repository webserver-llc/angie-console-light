/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { limitConnReqFactory } from './factories.js';

export function buildCalculator(){
	const httpLimitReq = {
		history: {},
		prevUpdatingPeriod: null
	};

	return limitConnReqFactory(httpLimitReq);
};

export default buildCalculator();
