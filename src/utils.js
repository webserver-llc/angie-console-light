/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

export const formatUptime = (ms, short = false) => {
	if (ms < 60000) {
		if (ms < 1000) {
			return `${ms}ms`;
		}

		return `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 10)}s`;
	}

	let result = '';

	const sec = ms / 1000;
	const days = Math.floor(sec / 86400);
	const hours = Math.floor((sec % 86400) / 3600);
	const minutes = Math.floor(((sec % 86400) % 3600) / 60);

	if (days) {
		result += `${ days }d `;
	}

	if (days || hours) {
		result += `${ hours }h `;
	}

	if ((days || hours || minutes) && !(short && days > 0)) {
		result += `${ minutes }m`;
	}

	return result;
};

export const formatReadableBytes = (
	bytes,
	maxMeasurementUnit,
	units = { 0: 'B', 1: 'KiB', 2: 'MiB', 3: 'GiB', 4: 'TiB' }
) => {
	if (isNaN(parseFloat(bytes)) || !isFinite(bytes) || bytes === 0) return '0';

	let maxUnit;
	let measure;
	let precision;

	if (maxMeasurementUnit) {
		Object.keys(units).forEach((key) => {
			if (units[key] === maxMeasurementUnit) {
				maxUnit = parseInt(key, 10);
			}
		});
	}

	if (bytes > 1099511627775) {
		measure = 4;
	} else if (bytes > 1048575999 && bytes <= 1099511627775) {
		measure = 3;
	} else if (bytes > 1024000 && bytes <= 1048575999) {
		measure = 2;
	} else if (bytes > 1023 && bytes <= 1024000) {
		measure = 1;
	} else if (bytes <= 1023) {
		measure = 0;
	}

	if (typeof maxUnit === 'number' && measure > maxUnit) {
		measure = maxUnit;
	}

	const floor = Math.floor(bytes / 1024 ** measure).toString().length;

	if (floor > 3) {
		precision = 0;
	} else {
		precision = 3 - floor;
	}

	return `${(bytes / (1024 ** measure)).toFixed(precision)} ${units[measure]}`;
};

export const formatMs = ms => ms === undefined ? '–' : `${ms}ms`;

export const formatDate = (timestamp) => {
	if (!timestamp) return '';

	const datetime = new Date(timestamp);
	const time = datetime.toTimeString().split(' ');

	return `${ datetime.toISOString().slice(0, 10) } ${ time[0] } ${ time[1] }`;
};

export default {
	formatUptime,
	formatReadableBytes,
	formatMs,
	formatDate,
};
