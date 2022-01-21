/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Portal from 'preact-portal';

import styles from './style.css';

export default class Popup extends React.Component {
	componentDidMount() {
		document.documentElement.classList.add(styles['disable-scroll']);
	}

	componentWillUnmount() {
		document.documentElement.classList.remove(styles['disable-scroll']);
	}

	render() {
		let popupCN = styles.popup;

		if (this.props.className) {
			popupCN += ` ${ this.props.className }`;
		}
		return (<Portal into="body">
			<div className={ styles.fader }>
				<div className={ styles.modal }>
					<div className={ popupCN }>
						{ this.props.children }
					</div>
				</div>
			</div>
		</Portal>);
	}
}