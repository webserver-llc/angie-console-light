/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2022-present, Igor Meleshchenko
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

	return `${(bytes / (1024 ** measure)).toFixed(precision)} ${units[measure]}`;
};

export const formatMs = ms => ms === undefined ? '–' : `${ms}ms`;

export const formatDate = (timestamp) => {
	if (!timestamp) return '';

	const datetime = new Date(timestamp);
	const time = datetime.toTimeString().split(' ');

	return `${ datetime.toISOString().slice(0, 10) } ${ time[0] } ${ time[1] }`;
};

export const getHTTPCodesArray = (codes, codeGroup) => {
	const result = [];

	if (codes && Object.keys(codes).length > 0) {
		Object.keys(codes).sort().forEach(code => {
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
		if ('no_common_protocol' in ssl) {
			result.push({
				id: 'no_common_protocol',
				label: 'No common protocol',
				value: ssl.no_common_protocol,
			});
		}

		if ('no_common_cipher' in ssl) {
			result.push({
				id: 'no_common_cipher',
				label: 'No common cipher',
				value: ssl.no_common_cipher,
			});
		}

		if ('handshake_timeout' in ssl) {
			result.push({
				id: 'handshake_timeout',
				label: 'Handshake timeout',
				value: ssl.handshake_timeout,
			});
		}

		if ('peer_rejected_cert' in ssl) {
			result.push({
				id: 'peer_rejected_cert',
				label: 'Rejected cert',
				value: ssl.peer_rejected_cert,
			});
		}

		if (ssl.verify_failures) {
			if ('expired_cert' in ssl.verify_failures) {
				result.push({
					id: 'expired_cert',
					label: 'Expired cert',
					value: ssl.verify_failures.expired_cert,
				});
			}

			if ('revoked_cert' in ssl.verify_failures) {
				result.push({
					id: 'revoked_cert',
					label: 'Revoked cert',
					value: ssl.verify_failures.revoked_cert,
				});
			}

			if ('hostname_mismatch' in ssl.verify_failures) {
				result.push({
					id: 'hostname_mismatch',
					label: 'Hostname mismatch',
					value: ssl.verify_failures.hostname_mismatch,
				});
			}

			if ('other' in ssl.verify_failures) {
				result.push({
					id: 'other',
					label: 'Other verify failures',
					value: ssl.verify_failures.other,
				});
			}
		}
	}

	return result;
};

export default {
	formatUptime,
	formatReadableBytes,
	formatMs,
	formatDate,
	getHTTPCodesArray,
	getSSLHandhsakesFailures,
};
