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
import styles from './style.css';
import tooltips from '../../tooltips/index.jsx';

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
			firstSortLabel,
			secondSortLabel,
			order,
			isActive,
			isInline,
			rowSpan,
		} = this.props;

		let className = styles.sorter;

		if (isActive) {
			className += ` ${ styles.sorterActive }`;
		}

		if (isInline) {
			className += ` ${ styles.inlinSorter }`;
		}

		return (
			<th
				rowSpan={singleRow ? 1 : rowSpan}
				className={className}
				onClick={this.toggle}

				{...tooltips.useTooltip(order === 'asc' ? secondSortLabel : firstSortLabel, 'hint-right')}
			>
				{
					order === 'asc' ? '▴' : '▾'
				}
			</th>
		);
	}
}

TableSortControl.defaultProps = {
	firstSortLabel: 'Отсортировать по порядку в конфигурации',
	secondSortLabel: 'Отсортировать по статусу &mdash; сначала проблемные',
	isActive: true,
	rowSpan: 2,
};
