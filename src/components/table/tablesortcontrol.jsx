/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class TableSortControl extends React.Component {
	constructor() {
		super();
		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		let { order } = this.props;

		if (order === 'desc') {
			order = 'asc';
		} else {
			order = 'desc';
		}

		this.props.onChange(order);
	}

	render() {
		return (<th rowSpan="2" styleName="sorter" onClick={this.toggle}>
			{
				this.props.order === 'asc' ? '▴' : '▾'
			}
		</th>);
	}
}
