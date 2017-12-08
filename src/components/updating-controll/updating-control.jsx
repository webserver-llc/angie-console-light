/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class UpdatingControl extends React.Component {
	constructor() {
		super();

		this.state = {
			expanded: false,
			state: true
		};

		this.toggle = this.toggle.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.update = this.update.bind(this);
	}

	toggle() {
		this.setState({
			expanded: !this.state.expanded
		});
	}

	play() {
		this.props.play();
		this.setState({
			state: true
		});
	}

	pause() {
		this.props.pause();
		this.setState({
			state: false
		});
	}

	update() {
		this.props.update(true);
		this.setState({
			state: true
		});
	}

	render() {
		return (
			<div styleName={ this.state.expanded ? 'expanded-control' : 'updating-control' }>
				<div styleName="toggle" onClick={this.toggle} />

				{
					this.state.state ?
						<div styleName="pause" onClick={this.pause} />
					:
						<div styleName="play" onClick={this.play} />
				}

				<div styleName="update" onClick={this.update} />
			</div>
		);
	}
}