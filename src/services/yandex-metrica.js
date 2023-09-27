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
