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
			<div className={ this.state.expanded ? styles['expanded-control'] : styles['updating-control'] }>
				<div className={ styles.toggle } onClick={this.toggle} />

				{
					this.state.state ?
						<div className={ styles.pause } onClick={this.pause} />
					:
						<div className={ styles.play } onClick={this.play} />
				}

				<div className={ styles.update } onClick={this.update} />
			</div>
		);
	}
}