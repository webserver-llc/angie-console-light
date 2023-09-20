/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class Disclaimer extends React.Component {
	constructor() {
		super();
		this.state = {
			opened: true
		};

		this.close = this.close.bind(this);
	}

	close() {
		this.setState({
			opened: false
		});
	}

	render() {
		if (this.state.opened === false) {
			return null;
		}

		return (
			<div className={styles.disclaimer}>
				<div className={styles['disclaimer-close']} onClick={this.close}>x</div>
				<div className={styles['disclaimer-content']}>
					Below is the example of the Angie Console Light. This page collects real time data from a demo instance of Angie.
					<br />
					For more information on configuration please visit
					{' '}
					<a href="https://angie.software/en/console/">https://angie.software/en/console/</a>
					<br />
					For purchasing Angie Pro please contact the sales team:
					{' '}
					<a href="https://wbsrv.ru/angie-pro/">https://wbsrv.ru/angie-pro/</a>
				</div>
			</div>
		);
	}
}
