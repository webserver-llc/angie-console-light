/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';
import { useTooltip } from '../../tooltips/index.jsx';

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
		const {
			singleRow,
			secondSortLabel,
			order
		} = this.props;

		return (
			<th
				rowSpan={ singleRow ? null : '2' }
				styleName="sorter"
				onClick={ this.toggle }

				{ ...useTooltip(order === 'asc' ? secondSortLabel : 'Sort by conf order', 'hint-right') }
			>{
				order === 'asc' ? '▴' : '▾'
			}</th>
		);
	}
}

TableSortControl.defaultProps = {
	secondSortLabel: 'Sort by status - failed first'
};
