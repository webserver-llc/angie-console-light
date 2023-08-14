const formatResponses = response => {
	function isEmpty(obj) {
		// eslint-disable-next-line no-restricted-syntax
		for (const prop in obj) {
			// eslint-disable-next-line no-prototype-builtins
			if (obj.hasOwnProperty(prop)) { return false; }
		}

		return true;
	}

	if (isEmpty(response)) return {};

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

	Object.keys(response).forEach(prop => {
		if (isStatusCode(prop)) {
			mapStatusCodeToResult(prop);
		}
	});

	result.codes = response;

	return result;
};

export default (response) => {
	Object.values(response).forEach(obj => {
		if (obj.responses) {
			obj.responses = formatResponses(obj.responses);
		}
	});
	return response;
};
