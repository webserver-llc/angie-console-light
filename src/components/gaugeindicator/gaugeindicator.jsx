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

export const WIDTH = 74;
export const HEIGHT = 37;
export const LINE_WIDTH = 9;

export const BG_COLOR = '#e3e8ed';
export const YELLOW_COLOR = '#f0c946';
export const GREEN_COLOR = '#8dc63f';

export default class GaugeIndicator extends Component {
	componentDidMount() {
		this.initCanvas();
		this.updateCanvas(this.props.percentage);
	}

	shouldComponentUpdate(nextProps) {
		return nextProps.percentage !== this.props.percentage;
	}

	componentWillUpdate(nextProps) {
		this.updateCanvas(nextProps.percentage);
	}

	initCanvas() {
		this.canvas.width = WIDTH * window.devicePixelRatio;
		this.canvas.height = HEIGHT * window.devicePixelRatio;
		this.canvas.style.height = `${HEIGHT}px`;
		this.canvas.style.width = `${WIDTH}px`;
		this.canvas.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	updateCanvas(percentage) {
		const ctx = this.canvas.getContext('2d');

		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		ctx.lineWidth = LINE_WIDTH;

		const drawArc = (rad, color) => {
			ctx.beginPath();
			ctx.arc(WIDTH / 2, HEIGHT, WIDTH / 2 - LINE_WIDTH / 2, Math.PI, rad, false);
			ctx.strokeStyle = color;
			ctx.stroke();
		};

		drawArc(2 * Math.PI, BG_COLOR);
		drawArc(Math.PI * (1 + percentage / 100), percentage < 40 ? YELLOW_COLOR : GREEN_COLOR);
	}

	render() {
		const { percentage } = this.props;

		return (<div className={ styles.gaugeindicator }>
			<canvas ref={(ref) => { this.canvas = ref; }} className={ styles.canvas } />
			{
				percentage !== null ?
					<span className={ styles.value }>{ percentage }%</span>
				: null
			}
		</div>);
	}
}