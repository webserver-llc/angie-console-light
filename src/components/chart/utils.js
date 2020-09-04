/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

export const getYMax = (parsedData, metrics, disabledMetrics) =>
	parsedData.reduce((max, { zone }) => {
		const newMax = metrics.reduce((memo, key) => {
			if (key in zone && !disabledMetrics.includes(key)) {
				memo += zone[key];
			}

			return memo;
		}, 0);

		return newMax > max ? newMax : max;
	}, 0);
