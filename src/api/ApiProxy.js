/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

/* eslint no-underscore-dangle: "off" */
export default class ApiProxy {
	constructor(apiPrefix, pathStart) {
		this.apiPrefix = apiPrefix;
		this.path = [pathStart];
		this.processors = [];
		this.__API_PROXY = true; /* Duck typing for tests */

		this.proxy = new Proxy(this, {
			get(target, propKey, proxy) {
				if (propKey in target) {
					return target[propKey];
				}

				target.path.push(propKey);
				return proxy;
			}
		});

		return this.proxy;
	}

	getUrl() {
		// TODO: use toString() instead
		return `${this.apiPrefix}/${this.toString()}/`;
	}

	doRequest(method, data) {
		const params = {
			method
		};

		if (data) {
			params.body = JSON.stringify(data);
		}

		return window.fetch(this.getUrl(), params)
			.then(response =>
				response.json().catch(() => {
					throw ({
						status: response.status
					});
				})
			);
	}

	get() {
		return this.doRequest('get');
	}

	post(data) {
		return this.doRequest('post', data);
	}

	patch(data) {
		return this.doRequest('PATCH', data);
	}

	del() {
		return this.doRequest('delete');
	}

	process(fn) {
		this.processors.push(fn);
		return this.proxy;
	}

	toString() {
		return this.path.join('/');
	}
}
