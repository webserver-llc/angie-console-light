/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import TableSortControl from '../../table/tablesortcontrol.jsx';
import Chart from '../../chart/index.jsx';
import styles from '../../table/style.css';

export class LimitConnReqConstructor extends React.Component {
	constructor(){
		super();

		this.state = {
			activeCharts: []
		};

		this.toggleChart = this.toggleChart.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState){
		return (
			this.props.data !== nextProps.data ||
			this.state.activeCharts.length !== nextState.activeCharts.length
		);
	}

	toggleChart(zoneName){
		if (this.state.activeCharts.includes(zoneName)) {
			this.setState({
				activeCharts: this.state.activeCharts.filter(
					zn => zn !== zoneName
				)
			});
		} else {
			this.setState({
				activeCharts: this.state.activeCharts.concat(zoneName)
			});
		}
	}

	getTitle(){}

	getHeadRow(){}

	getBody(){
		return null;
	}

	render(){
		const { activeCharts } = this.state;
		const { data } = this.props;
		let component = null;

		if (data) {
			component = (
				<div>
					<h1>{ this.getTitle() }</h1>

					<table styleName="table wide">
						<thead>{ this.getHeadRow() }</thead>
						<tbody styleName="right-align">
							{ this.getBody() }
						</tbody>
					</table>
				</div>
			);
		}

		return component;
	}
}
