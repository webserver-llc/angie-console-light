/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Icon from '../../../icon/icon.jsx';
import styles from './styles.css';

// It is class because enzyme with preact can't render props.children
export default class IndexBox extends React.Component {
	render() {
		return (
			<div styleName="box" className={this.props.className}>
				{
					this.props.title ?
						<a styleName="header" href={this.props.href}>
							{ this.props.title }
							{
								'status' in this.props ?
									<Icon type={this.props.status} styleName="status" />
									: null
							}
						</a>
						: null
				}

				{ this.props.children }
			</div>
		);
	}
}
