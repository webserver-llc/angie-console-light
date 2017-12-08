/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React, { Component } from 'react';
import styles from './style.css';

export default class ProgressBar extends Component {
	shouldComponentUpdate(nextProps) {
		return nextProps.percentage !== this.props.percentage;
	}

	render() {
		let { percentage } = this.props;
		let toShow;

		if (this.props.percentage === -1) {
			toShow = '<1 %';
			percentage = 1;
		} else {
			toShow = `${percentage} %`;
		}

		let styleName = 'progress-bar';

		if (this.props.danger) {
			styleName = 'progress-bar danger';
		} else if (this.props.warning) {
			styleName = 'progress-bar warning';
		}

		return (<div styleName={styleName}>
			{ toShow }

			<div styleName="fulfillment" style={{ width: `${percentage}%` }}>
				{ toShow }
			</div>
		</div>);
	}
}
