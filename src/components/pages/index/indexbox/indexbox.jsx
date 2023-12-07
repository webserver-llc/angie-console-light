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
import Icon from '../../../icon/icon.jsx';
import styles from './styles.css';

// It is class because enzyme with preact can't render props.children
export default class IndexBox extends React.Component {
	render() {
		let className = styles.box;

		if (this.props.className) {
			className += ` ${ this.props.className }`;
		}

		return (
			<div className={ className }>
				{
					this.props.title ?
						<a
							className={ styles.header }
							href={ this.props.href }
							title={ this.props.title }
						>
							{ this.props.title }
							{
								'status' in this.props ?
									<Icon type={this.props.status} className={ styles.status } />
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
