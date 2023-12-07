/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import appsettings from '../../appsettings';

export default class SortableTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			sortOrder: appsettings.getSetting(this.SORTING_SETTINGS_KEY, 'asc')
		};

		this.changeSorting = this.changeSorting.bind(this);
	}

	changeSorting(sortOrder) {
		this.setState({
			sortOrder
		});

		appsettings.setSetting(this.SORTING_SETTINGS_KEY, sortOrder);
	}
}
