/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint-disable import/prefer-default-export */
/* global ym, __YANDEX_METRICA_ID__ */
function sendHit(url, title) {
	if (typeof ym === 'function') {
		ym(__YANDEX_METRICA_ID__, 'hit', url, {
			params: {
				title,
			}
		});
	}
}

export const ymService = {
	sendHit,
};
