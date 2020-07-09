/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

 export default class AvailableApiEndpoints {
	constructor(){
		this.firstLevel = [];
		this.secondLevel = {
			http: [],
			stream: []
		}
	}

	getFirstLevel(){
		return this.firstLevel;
	}

	getSecondLevel(){
		return Object.keys(this.secondLevel);
	}

	getThirdLevel(secondLevelEndpoint){
		return this.secondLevel[secondLevelEndpoint];
	}

	firstLevelIncludes(path){
		return this.firstLevel.includes(path);
	}

	fillThirdLevel(secondLevelEndpoint, endpoints){
		this.secondLevel[secondLevelEndpoint] = [ ...endpoints ];
	}

	secondLevelIncludes(endpoint){
		return endpoint in this.secondLevel;
	}

	thirdLevelIncludes(secondLevelEndpoint, endpoint){
		return (
			secondLevelEndpoint in this.secondLevel &&
			this.secondLevel[secondLevelEndpoint].includes(endpoint)
		);
	}

	fillFirstLevel(endpoints){
		this.firstLevel = [ ...endpoints ];
	}
};
