/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import styles from './number-control.css';

export default class NumberControl extends React.Component {
	constructor(props){
		super(props);

		this.inc = this.inc.bind(this);
		this.dec = this.dec.bind(this);
	}

	inc() {
		this.props.onChange(this.props.value + 1000);
	}

	dec() {
		this.props.onChange(this.props.value - 1000);
	}

	render() {
		return (<div className={ styles['number-control'] }>
			<span className={ styles.dec } onClick={this.dec}>-</span>
			<span className={ styles.value }>{this.props.value / 1000}</span>
			<span className={ styles.inc } onClick={this.inc}>+</span>
		</div>);
	}
}