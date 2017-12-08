/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import { getSetting, setSetting } from '../../appsettings';

export default class SortableTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			sortOrder: getSetting(this.SORTING_SETTINGS_KEY, 'asc')
		};

		this.changeSorting = this.changeSorting.bind(this);
	}

	changeSorting(sortOrder) {
		this.setState({
			sortOrder
		});

		setSetting(this.SORTING_SETTINGS_KEY, sortOrder);
	}
}
