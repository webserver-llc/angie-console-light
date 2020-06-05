/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { limitConnReqFactory } from './utils.js';

export default (() => {
	let httpLimitConnHistory = {};
	let previousUpdatingPeriod = null;

	return limitConnReqFactory(httpLimitConnHistory, previousUpdatingPeriod);
})();
