/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
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
		result += `${days}d `;
	}

	if (days || hours) {
		result += `${hours}h `;
	}

	if ((days || hours || minutes) && !(short && days > 0)) {
		result += `${minutes}m`;
	}

	return result;
};

export const formatReadableBytes = (
	bytes,
	maxMeasurementUnit,
	units = { 0: 'B', 1: 'KiB', 2: 'MiB', 3: 'GiB', 4: 'TiB' },
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
	} else {
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

	return `${(bytes / 1024 ** measure).toFixed(precision)} ${units[measure]}`;
};

export const formatMs = (ms) => (ms === undefined ? '–' : `${ms}ms`);

export const formatDate = (timestamp) => {
	if (!timestamp) return '';

	const datetime = new Date(timestamp);
	const time = datetime.toTimeString().split(' ');

	return `${datetime.toISOString().slice(0, 10)} ${time[0]} ${time[1]}`;
};

export const formatLastCheckDate = (timestamp) => {
	const unixTimestamp = Date.now() - new Date(timestamp).valueOf();
	if (unixTimestamp < 0) {
		// eslint-disable-next-line no-console
		console.warn(
			'Incorrect timestamp or invalid datetime setting on PC. Check your settings',
			timestamp,
		);
		return '-';
	}
	return formatUptime(unixTimestamp);
};

export const getHTTPCodesArray = (codes, codeGroup) => {
	const result = [];

	if (codes && Object.keys(codes).length > 0) {
		Object.keys(codes)
			.sort()
			.forEach((code) => {
				if (`${code}`.startsWith(codeGroup)) {
					result.push({
						code,
						value: codes[code],
					});
				}
			});
	}

	return result;
};

export const getSSLHandhsakesFailures = (ssl) => {
	const result = [];

	if (ssl) {
		if ('handshake_timeout' in ssl) {
			result.push({
				id: 'handshake_timeout',
				label: 'Handshake timedout',
				value: ssl.handshake_timeout,
			});
		}
	}

	return result;
};

export const getSSLVeryfiedFailures = (ssl) => {
	const result = [];
	let total = 0;

	if (ssl && ssl.verify_failures) {
		if ('no_cert' in ssl.verify_failures) {
			result.push({
				id: 'no_cert',
				label: 'No certificate',
				value: ssl.verify_failures.no_cert,
			});

			total += ssl.verify_failures.no_cert;
		}

		if ('expired_cert' in ssl.verify_failures) {
			result.push({
				id: 'expired_cert',
				label: 'Expired cert',
				value: ssl.verify_failures.expired_cert,
			});

			total += ssl.verify_failures.expired_cert;
		}

		if ('revoked_cert' in ssl.verify_failures) {
			result.push({
				id: 'revoked_cert',
				label: 'Revoked cert',
				value: ssl.verify_failures.revoked_cert,
			});

			total += ssl.verify_failures.revoked_cert;
		}

		if ('hostname_mismatch' in ssl.verify_failures) {
			result.push({
				id: 'hostname_mismatch',
				label: 'Hostname mismatch',
				value: ssl.verify_failures.hostname_mismatch,
			});

			total += ssl.verify_failures.hostname_mismatch;
		}

		if ('other' in ssl.verify_failures) {
			result.push({
				id: 'other',
				label: 'Other verify failures',
				value: ssl.verify_failures.other,
			});

			total += ssl.verify_failures.other;
		}
	}

	return [total, result];
};

export const formatNumber = (value) =>
	typeof value === 'number' ? value : '-';

export const isEmptyObj = (obj) => {
	if (obj === undefined) {
		throw new Error("Argument doesn't set or undefined");
	}

	if (obj === null) {
		throw new Error('Null is not available argument');
	}

	// eslint-disable-next-line no-restricted-syntax
	for (const prop in obj) {
		// eslint-disable-next-line no-prototype-builtins
		if (obj.hasOwnProperty(prop)) {
			return false;
		}
	}

	return true;
};

export const formatHttpResponse = (response) => {
	if (isEmptyObj(response)) return response;

	const result = {
		'1xx': 0,
		'2xx': 0,
		'3xx': 0,
		'4xx': 0,
		'5xx': 0,
		codes: {},
		total: 0,
	};

	function isStatusCode(statusCode) {
		return parseInt(statusCode, 10).toString() === statusCode;
	}

	function mapStatusCodeToResult(statusCode) {
		const firstChar = statusCode[0];
		if (firstChar === '1') {
			result['1xx'] += response[statusCode];
		}
		if (firstChar === '2') {
			result['2xx'] += response[statusCode];
		}
		if (firstChar === '3') {
			result['3xx'] += response[statusCode];
		}
		if (firstChar === '4') {
			result['4xx'] += response[statusCode];
		}
		if (firstChar === '5') {
			result['5xx'] += response[statusCode];
		}
		result.total += response[statusCode];
	}

	Object.keys(response).forEach((prop) => {
		if (isStatusCode(prop)) {
			mapStatusCodeToResult(prop);
		}
	});

	result.codes = response;

	return result;
};

export const isIP = (value) => {
	/* eslint-disable max-len, no-useless-escape */
	const RGX_IPV4 =
		/^\s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?\s*$/;
	const RGX_IPV6_FULL =
		/^\s*\[((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\](?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))\s*$/;
	const RGX_IPV6 =
		/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
	/* eslint-enable max-len, no-useless-escape */
	return (
		RGX_IPV4.test(value) || RGX_IPV6_FULL.test(value) || RGX_IPV6.test(value)
	);
};

export default {
	formatUptime,
	formatReadableBytes,
	formatMs,
	formatDate,
	formatNumber,
	formatHttpResponse,
	formatLastCheckDate,
	getHTTPCodesArray,
	getSSLHandhsakesFailures,
	getSSLVeryfiedFailures,
	isEmptyObj,
	isIP,
};
