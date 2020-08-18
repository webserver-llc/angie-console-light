/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import { createMapFromObject } from './utils.js';

export function handleZones(zone){
	zone.pages.total = zone.pages.used + zone.pages.free;
	zone.percentSize = Math.ceil(zone.pages.used / zone.pages.total * 100);

	return zone;
};

export default (sharedZones, previous, { __STATUSES }) => {
	if (sharedZones === null || Object.keys(sharedZones).length === 0) {
		__STATUSES.shared_zones.ready = false;
		return null;
	}

	__STATUSES.shared_zones.ready = true;

	return createMapFromObject(sharedZones, handleZones);
};

