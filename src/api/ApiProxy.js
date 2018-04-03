/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

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

	doRequest(method, data, fetchParams = {}) {
		const params = {
			method,
			credentials: 'same-origin',
			...fetchParams
		};

		if (data) {
			params.body = JSON.stringify(data);
		}

		return window.fetch(this.getUrl(), params)
			.then((response) => {
				let err = false;

				if (response.status > 299) {
					err = true;
				}

				return response.json().then(data => {
					if (err) {
						throw data;
					}

					return data;
				}).catch((data) => {
					throw ({
						error: data.error ? `${data.error.code}: ${data.error.text}` : null,
						status: response.status
					});
				});
			});
	}

	get(fetchParams) {
		return this.doRequest('GET', null, fetchParams);
	}

	post(data, fetchParams) {
		return this.doRequest('POST', data, fetchParams);
	}

	patch(data, fetchParams) {
		return this.doRequest('PATCH', data, fetchParams);
	}

	del(fetchParams) {
		return this.doRequest('DELETE', null, fetchParams);
	}

	process(fn) {
		this.processors.push(fn);
		return this.proxy;
	}

	toString() {
		return this.path.join('/');
	}
}
