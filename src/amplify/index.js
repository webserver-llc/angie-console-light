/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import styles from './style.css';

const AMPLIFY_URL = __CONFIG__AMPLIFY_URL; // __CONFIG__AMPLIFY_URL defined in webpack
const LOCALSTORAGE_KEY_NAME = '__AMPLIFY_OBJECT_ID';

const PLUS_DASHBOARD_URL = `${window.location.origin}${window.location.pathname}`;

let container = null;

export const getAmplifyObjectId = () => localStorage.getItem(LOCALSTORAGE_KEY_NAME);

export const getDashboardUrl = () => {
	const objectId = getAmplifyObjectId();

	if (objectId && objectId !== 'null') {
		return `${AMPLIFY_URL}/dashboard/${objectId}?statusPageURL=${PLUS_DASHBOARD_URL}`;
	}

	return `${AMPLIFY_URL}/dashboard/`;
};

export const closeIframe = () => {
	document.body.removeChild(container);
};

let callbacks = [];

export const initAmplify = () => {
	window.addEventListener('message', (evt) => {

		let data = {};

		try {
			data = JSON.parse(evt.data);
		} catch(e) {}

		switch (data.action) {
			case 'amplify_close':
				closeIframe();
				callbacks = [];
				break;

			case 'amplify_show':
				container.style.display = 'block';
				break;

			case 'amplify_success':
				localStorage.setItem(LOCALSTORAGE_KEY_NAME, data.payload);
				callbacks.pop()();
				break;
		}
	});
};

export const openLogin = (pid, callback) => {
	container = document.createElement('div');
	container.className = styles.fader;
	container.style.display = 'none';
	const iframe = document.createElement('iframe');

	iframe.src = `${AMPLIFY_URL}/pd/login?parentURL=${encodeURIComponent(PLUS_DASHBOARD_URL)}&pid=${pid}`;
	iframe.className = styles.iframe;

	container.appendChild(iframe);
	document.body.appendChild(container);

	callbacks.push(callback);
};
