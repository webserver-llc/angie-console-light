/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
export default class ApiProxy {
	constructor(apiPrefix, pathStart) {
		this.apiPrefix = apiPrefix;
		this.path = [pathStart];
		this.processors = [];
		this.mapper = null;
		this.mock = null;
		this.__API_PROXY = true; /* Duck typing for tests */

		this.proxy = new Proxy(this, {
			get(target, propKey, proxy) {
				if (propKey in target) {
					return target[propKey];
				}

				target.path.push(propKey);
				return proxy;
			},
		});

		return this.proxy;
	}

	getUrl(searchParams = {}) {
		const urlSearchParams = new URLSearchParams(searchParams);
		const size = Array.from(urlSearchParams).length;
		if (size) {
			return `${this.apiPrefix}/${this.toString()}?${urlSearchParams}`;
		}
		// TODO: use toString() instead
		return `${this.apiPrefix}/${this.toString()}/`;
	}

	doRequest(method, data, fetchParams = {}) {
		const { searchParams, ...otherParams } = fetchParams;

		const params = {
			method,
			credentials: 'same-origin',
			...otherParams,
		};

		if (typeof this.mock === 'function') {
			const response = this.mock(params);
			return this.mapper ? Promise.resolve(this.mapper(response)) : Promise.resolve(response);
		}

		if (data) {
			params.body = JSON.stringify(data);
		}

		return window.fetch(this.getUrl(searchParams), params).then((response) => {
			let err = false;

			if (response.status > 299) {
				err = true;
			}

			return response
				.json()
				.then((data) => {
					if (err) {
						throw data;
					}

					if (this.mapper) {
						return this.mapper(data);
					}

					return data;
				})
				.catch((data) => {
					if (response.status === 403) {
						data.error = 'Forbidden';
					}
					throw {
						error: data.error ? `${data.error}: ${data.description}` : null,
						status: response.status,
					};
				});
		});
	}

	get(fetchParams) {
		return this.doRequest('GET', null, fetchParams);
	}

	post(data, fetchParams) {
		return this.doRequest('POST', data, fetchParams);
	}

	put(data, fetchParams) {
		return this.doRequest('PUT', data, fetchParams);
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

	setMapper(fn) {
		this.mapper = fn;
		return this.proxy;
	}

	setMock(fn) {
		this.mock = fn;
		return this.proxy;
	}

	toString() {
		return this.path.join('/');
	}
}
