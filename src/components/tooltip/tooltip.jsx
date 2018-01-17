/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class Tooltip extends React.Component {
	constructor(props) {
		super();

		this.state = {
			top: props.top,
			left: props.left
		};
	}

	componentDidMount() {
		this.reposition();
	}

	reposition() {
		let state = this.state;

		if (this.ref){
			const { width, height } = this.ref.getBoundingClientRect();

			if (this.props.align === 'center') {
				state = {
					...state,
					top: this.props.top,
					left: this.props.left - (width - this.props.anchorWidth) / 2
				};
			}

			if (this.props.position === 'top') {
				state = {
					...state,
					top: state.top - height - 40
				};
			} else if (this.props.position === 'right') {
				state = {
					...state,
					top: state.top - this.props.anchorHeight,
					left: state.left + this.props.anchorWidth + 10
				};
			}

			this.setState(state);
		}
	}

	render() {
		const { children, position = 'bottom', align = '' } = this.props;

		return (
			<div
				styleName={`tooltip ${position} ${align}`}
				ref={(ref) => { this.ref = ref; }}
				style={{
				     top: `${this.state.top}px`,
				     left: `${this.state.left}px`
			     }}
			>{children}</div>
		);
	}
}
