/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import appsettings from '../appsettings';

export const is4xxThresholdReached = obj =>
	obj.responses['4xx'] / obj.requests.total * 100 > appsettings.getSetting('warnings4xxThresholdPercent');

export const calculateSpeed = (previous, now, period) => {
	if (
		typeof previous !== 'number' ||
		typeof now !== 'number'
	) {
		return 'n/a';
	}

	if (previous > now) {
		return 0;
	}

	return Math.floor((now - previous) * 1000 / period);
};

export const calculateTraffic = ({ traffic }, zone) => {
	traffic.in += typeof zone.rcvd_s === 'number' ? zone.rcvd_s : 0;
	traffic.out += typeof zone.sent_s === 'number' ? zone.sent_s : 0;
};

export const createMapFromObject = (obj, fn, sort = true) => {
	const keys = Object.keys(obj);

	if (sort) {
		keys.sort();
	}

	return new Map(keys.map((key, i) => [
		key, fn(obj[key], key, i)
	]));
};

export const handleErrors = (previousData, data, key = 'responses') => {
	// Flashing cell of 4xx
	if (previousData && data[key]['4xx'] > previousData[key]['4xx']) {
		data['4xxChanged'] = true;
	}

	// Error and flashing cell of 5xx
	if (previousData && data[key]['5xx'] > previousData[key]['5xx']) {
		data['5xxChanged'] = true;
	}
};

export const pickZoneSize = (obj, slabs, zoneName) => {
	obj.zoneSize = null;

	if (slabs) {
		const zone = slabs.get(zoneName);

		if (zone) {
			obj.slab = zone;
			obj.zoneSize = zone.percentSize;
		}
	}
};

export const countResolverResponses = (responses) => {
	let allResponses = 0;
	let errResponses = 0;

	Object.keys(responses).forEach(key => {
		if (typeof responses[key] === 'number') {
			if (key !== 'timedout') {
				allResponses += responses[key];
			}

			if (key !== 'noerror') {
				errResponses += responses[key];
			}
		}
	});

	return {
		allResponses,
		errResponses
	};
};

export default {
	is4xxThresholdReached,
	calculateSpeed,
	calculateTraffic,
	createMapFromObject,
	handleErrors,
	pickZoneSize,
	countResolverResponses,
};
