/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

export default class AvailableApiEndpoints {
	constructor() {
		this.firstLevel = [];
		this.secondLevel = {
			http: [],
			stream: []
		};
	}

	getFirstLevel() {
		return this.firstLevel;
	}

	getSecondLevel() {
		return Object.keys(this.secondLevel);
	}

	getThirdLevel(secondLevelEndpoint) {
		return this.secondLevel[secondLevelEndpoint];
	}

	firstLevelIncludes(path) {
		return this.firstLevel.includes(path);
	}

	fillThirdLevel(secondLevelEndpoint, endpoints) {
		this.secondLevel[secondLevelEndpoint].push(...Object.keys(endpoints));
	}

	secondLevelIncludes(endpoint) {
		return endpoint in this.secondLevel;
	}

	thirdLevelIncludes(secondLevelEndpoint, endpoint) {
		return (
			secondLevelEndpoint in this.secondLevel &&
			this.secondLevel[secondLevelEndpoint].includes(endpoint)
		);
	}

	fillFirstLevel(endpoints) {
		this.firstLevel.push(...Object.keys(endpoints));
	}

	removeEndpoint(path) {
		const isAvailable = this.firstLevelIncludes(path[0]);

		if (
			isAvailable &&
			this.secondLevelIncludes(path[0]) &&
			this.thirdLevelIncludes(path[0], path[1])
		) {
			const index = this.secondLevel[path[0]].indexOf(path[1]);
			this.secondLevel[path[0]].splice(index, 1);
			if (this.secondLevel[path[0]].length !== 0) {
				return;
			}
		}

		if (isAvailable) {
			const index = this.firstLevel.indexOf(path[0]);
			this.firstLevel.splice(index, 1);
		}
	}

	reset() {
		this.firstLevel = [];
		this.secondLevel = {
			http: [],
			stream: []
		};
	}
}
