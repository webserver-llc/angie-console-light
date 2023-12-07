/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
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

		let cn = styles['progress-bar'];

		if (this.props.danger) {
			cn += ` ${ styles.danger }`;
		} else if (this.props.warning) {
			cn += ` ${ styles.warning }`;
		}

		return (<div className={ cn }>
			{ toShow }

			<div className={ styles.fulfillment } style={{ width: `${percentage}%` }}>
				{ toShow }
			</div>
		</div>);
	}
}
