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
import utils from './utils.js';
import styles from './style.css';
import appsettings from '../../appsettings';
import { limitConnReqHistoryLimit } from '../../calculators/factories.js';

export const chartDimensions = {
	width: 1150,
	height: 250,
	offsetTop: 70,
	offsetLeft: 50,
	offsetBottom: 30,
	offsetRight: 20,
	textOffset: 5,
	tickSize: 6
};
export const TimeWindows = new Map([
	['1 мин.', 60],
	['5 мин.', 5 * 60],
	['15 мин.', 15 * 60]
]);
export const TimeWindowDefault = '5 мин.';

export default class Chart extends React.Component {
	constructor(props){
		super(props);

		let selectedTimeWindow = appsettings.getSetting('timeWindow');

		if (!selectedTimeWindow || !TimeWindows.has(selectedTimeWindow)) {
			selectedTimeWindow = TimeWindowDefault;
		}

		this.state = {
			disabledMetrics: [],
			highlightedMetric: null,
			mouseOffsetX: null,
			selectedTimeWindow,
			timeEnd: props.data.ts,
			dndIsInProgress: false,
			dndPointsIndicies: null
		};

		this.historyLimit = limitConnReqHistoryLimit;

		this.highlightMetricTimer = null;
		this.highlightedMetric = null;

		this.mouseOffsetX = null;
		this.mouseMoveTimer = null;

		this.dndStartX = 0;
		this.dndMoveX = 0;
		this.pointsIndicies = '0,0';

		this.drawCursorLine = this.drawCursorLine.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.redraw = this.redraw.bind(this);
		this.highlightMetric = this.highlightMetric.bind(this);
		this.onSettingsChange = this.onSettingsChange.bind(this);

		this.redraw();
	}

	componentDidMount(what){
		this.settingsListener = appsettings.subscribe(this.onSettingsChange, 'timeWindow');
	}

	componentWillUnmount(){
		appsettings.unsubscribe(this.settingsListener);
	}

	componentWillReceiveProps(nextProps){
		const nextData = nextProps.data;
		const { data } = this.props;

		if (nextData.ts > data.ts) {
			const { dndPointsIndicies } = this.state;
			const nextState = {
				timeEnd: nextData.ts
			};

			if (
				dndPointsIndicies !== null &&
				nextData.data.length === this.historyLimit
			) {
				const updatingPeriod = parseInt(appsettings.getSetting('updatingPeriod'), 10) / 1000;
				const indiciesShift = Math.round((nextData.ts - data.ts) / updatingPeriod);

				nextState.dndPointsIndicies = this.state.dndPointsIndicies
					.split(',')
					.reduce((memo, index, i, initialIndicies) => {
						const reducedIndex = index - indiciesShift;

						if (memo === '') {
							return reducedIndex > 0 ? `${ reducedIndex }` : '0';
						}
						if (memo === '0') {
							return `${ memo },${ index - initialIndicies[0] }`;
						}
						return `${ memo },${ reducedIndex }`;
					}, '');
			}

			this.redraw(nextState, nextProps);
		}
	}

	shouldComponentUpdate(nextProps, nextState){
		if (this.state.dndIsInProgress) {
			return this.state.dndPointsIndicies !== nextState.dndPointsIndicies;
		} return true;
	}

	onSettingsChange(value){
		this.redraw({
			selectedTimeWindow: value,
			dndPointsIndicies: null
		});
	}

	onMouseLeave(){
		if (this.mouseMoveTimer !== null) {
			clearTimeout(this.mouseMoveTimer);
			this.mouseMoveTimer = null;
		}

		this.setState({
			mouseOffsetX: null,
			dndIsInProgress: false
		});
	}

	drawCursorLine(){
		if (!this.state.dndIsInProgress) {
			this.setState({ mouseOffsetX: this.mouseOffsetX });
		}
	}

	onMouseDown(evt){
		this.dndStartX = evt.offsetX;
		this.dndMoveX = evt.offsetX;

		const nextState = {
			dndIsInProgress: true,
			mouseOffsetX: null
		};

		if (this.state.dndPointsIndicies === null) {
			nextState.dndPointsIndicies = this.pointsIndicies;
		}

		this.redraw(nextState);
	}

	onMouseUp(){
		const nextState = {
			dndIsInProgress: false
		};

		if (
			this.state.dndPointsIndicies !== null &&
			this.state.dndPointsIndicies.includes(`${ this.props.data.data.length - 1 }`)
		) {
			nextState.dndPointsIndicies = null;
		}

		this.redraw(nextState);
	}

	onMouseMove(evt){
		const { offsetX } = evt;

		if (this.state.dndIsInProgress) {
			if (Math.abs(this.dndStartX - offsetX) < Math.abs(this.dndStartX - this.dndMoveX)) {
				this.dndStartX = offsetX;
				this.dndMoveX = offsetX;
			} else {
				this.dndMoveX = offsetX;

				const { data: { data } } = this.props;
				const dndPointsIndicies = this.state.dndPointsIndicies.split(',');
				let k;

				switch (this.state.selectedTimeWindow){
					case '1 мин.':
						k = 20;
						break;

					case '5 мин.':
						k = 10;
						break;

					case '15 мин.':
						k = 5;
						break;
				}

				const path = (offsetX < this.dndStartX ? -1 : 1) * Math.floor(Math.abs(offsetX - this.dndStartX) / k);

				if (path !== 0) {
					const maxIndex = data.length - 1;

					this.dndStartX += path * 20;

					if (
						path > 0 && dndPointsIndicies[0] > 0 ||
						path < 0 && dndPointsIndicies[1] < maxIndex
					) {
						this.redraw({
							dndPointsIndicies: dndPointsIndicies.reduce(
								(memo, index, i, initialIndicies) => {
									const changedIndex = index - path;

									if (memo === '') {
										return changedIndex > 0 ? `${ changedIndex }` : '0';
									}
									if (memo === '0') {
										return `${ memo },${ index - initialIndicies[0] }`;
									} if (changedIndex > maxIndex) {
										const pathOverflow = changedIndex - maxIndex;

										return `${ memo - pathOverflow },${ maxIndex }`;
									}
									return `${ memo },${ changedIndex }`;
								}, ''
							)
						});
					}
				}
			}
		} else {
			this.mouseOffsetX = chartDimensions.offsetLeft + offsetX;

			if (this.mouseMoveTimer === null) {
				this.mouseMoveTimer = setTimeout(() => {
					this.drawCursorLine();

					this.mouseMoveTimer = null;
				}, 100);
			}
		}
	}

	emulateDnd(direction, toBorder){
		const { data: { data } } = this.props;
		const { dndPointsIndicies } = this.state;
		const pointsIndicies = (
			dndPointsIndicies !== null ? dndPointsIndicies : this.pointsIndicies
		).split(',').map(i => parseInt(i, 10));
		const indiciesDiff = pointsIndicies[1] - pointsIndicies[0];
		let nextDndPointsIndicies;

		if (
			!toBorder && (
				direction > 0 && data.length - 1 - pointsIndicies[1] <= indiciesDiff ||
				direction < 0 && pointsIndicies[0] <= indiciesDiff
			)
		) {
			toBorder = true;
		}

		if (toBorder) {
			if (direction > 0) {
				nextDndPointsIndicies = null;
			} else {
				nextDndPointsIndicies = `0,${ indiciesDiff }`;
			}
		} else {
			nextDndPointsIndicies = `${ pointsIndicies[0] + direction * indiciesDiff },${ pointsIndicies[1] + direction * indiciesDiff }`;
		}

		this.redraw({
			dndPointsIndicies: nextDndPointsIndicies
		});
	}

	deferredHighlightMetric(metric){
		this.highlightedMetric = metric;

		if (this.highlightMetricTimer === null) {
			this.highlightMetricTimer = setTimeout(
				this.highlightMetric,
				200
			);
		}
	}

	highlightMetric(){
		this.highlightMetricTimer = null;

		if (this.highlightedMetric !== this.state.highlightedMetric) {
			this.redraw({
				highlightedMetric: this.highlightedMetric
			});
		}
	}

	toggleMetric(name){
		const { disabledMetrics } = this.state;

		this.redraw({
			disabledMetrics: disabledMetrics.includes(name) ?
				disabledMetrics.filter(metric => metric !== name)
				: disabledMetrics.concat(name),
			highlightedMetric: null
		});
	}

	redraw(nextState = {}, nextProps){
		const {
			colors,
			labels,
			data: { data }
		} = nextProps || this.props;
		const {
			disabledMetrics,
			highlightedMetric,
			selectedTimeWindow,
			timeEnd,
			dndPointsIndicies
		} = { ...this.state, ...nextState };
		const {
			width, height,
			offsetLeft, offsetTop, offsetBottom, offsetRight,
			textOffset, tickSize
		} = chartDimensions;

		this.ticks = [];
		this.points = [];
		this.toRender = {
			yMax: null,
			yMid: null,
			charts: [],
			areas: [],
			legend: [],
			tooltipPoints: []
		};
		this.dndAllowed = false;

		const updatingPeriod = parseInt(appsettings.getSetting('updatingPeriod'), 10) / 1000;
		const chartWidth = width - offsetLeft - offsetRight;
		const chartHeight = height - offsetTop - offsetBottom;
		let timeDiff = TimeWindows.get(selectedTimeWindow) + 0.2 * updatingPeriod;
		let timeStart = timeEnd - timeDiff;
		let xStep = null;

		if (data.length > 0) {
			const firstPointIndex = data.findIndex(point => point._ts >= timeStart);

			if (firstPointIndex >= 0) {
				if (firstPointIndex > 0) {
					this.dndAllowed = true;

					if (data[firstPointIndex]._ts - timeStart < 2 * updatingPeriod) {
						timeStart = data[firstPointIndex]._ts;
						timeDiff = timeEnd - timeStart;
					}
				}

				let parsedData;

				if (dndPointsIndicies) {
					parsedData = data.slice(...dndPointsIndicies.split(','));
					timeStart = parsedData[0]._ts;
					timeDiff = parsedData[parsedData.length - 1]._ts - timeStart;
				} else {
					parsedData = data.slice(firstPointIndex);
				}

				const metrics = Array.from(colors.keys());

				xStep = chartWidth / timeDiff;

				let yMax = utils.getYMax(parsedData, metrics, disabledMetrics);

				if (yMax > 0) {
					if (yMax % 2 === 1) {
						yMax += 1;
					}

					this.toRender.yMax = [
						<text
							key="y-max-label"
							className={styles['y-label']}
							x={offsetLeft - textOffset}
							y={offsetTop}
						>
							{ yMax }
						</text>,
						<line
							key="y-max-line"
							className={styles['x-line']}
							x1={offsetLeft}
							x2={offsetLeft + chartWidth}
							y1={offsetTop}
							y2={offsetTop}
						/>
					];

					const yMidCoord = offsetTop + chartHeight / 2;

					this.toRender.yMid = [
						<text
							key="y-mid-label"
							className={styles['y-label']}
							x={offsetLeft - textOffset}
							y={yMidCoord}
						>
							{ yMax / 2 }
						</text>,
						<line
							key="y-mid-line"
							className={styles['x-line']}
							x1={offsetLeft}
							x2={offsetLeft + chartWidth}
							y1={yMidCoord}
							y2={yMidCoord}
						/>
					];
				}

				const yStep = yMax > 0 ? (chartHeight / yMax) : 0;
				const charts = {};

				parsedData.forEach((point, i) => {
					const x = offsetLeft + (point._ts - timeStart) * xStep;
					const values = {};
					let valuesStack = 0;

					for (let j = metrics.length - 1; j >= 0; j--) {
						const key = metrics[j];

						if (!disabledMetrics.includes(key)) {
							const value = point.obj[key];
							const y = offsetTop + chartHeight - yStep * (value + valuesStack);

							if (i === 0) {
								charts[key] = {
									path: `M ${ x } ${ y }`,
									coordinates: [[x, y]]
								};
							} else {
								charts[key].path += ` L ${ x } ${ y }`;
								charts[key].coordinates.push([x, y]);
							}

							valuesStack += value;
							values[key] = value;
						}
					}

					this.points.push({
						x,
						values,
						_ts: point._ts
					});
				});

				for (let i = metrics.length - 1; i >= 0; i--) {
					const key = metrics[i];

					if (key in charts) {
						const isFaded = highlightedMetric !== null && highlightedMetric !== key;

						this.toRender.charts.push(
							<path
								key={`chart_${ key }`}
								className={`${ styles.line }${ isFaded ? (` ${ styles.faded}`) : '' }`}
								style={{ stroke: colors.get(key) }}
								d={charts[key].path}
							/>
						);

						let prevKey = null;

						if (i < metrics.length - 1) {
							let j = i + 1;

							while (j < metrics.length && prevKey === null) {
								if (disabledMetrics.includes(metrics[j])) {
									j++;
								} else {
									prevKey = metrics[j];
								}
							}
						}

						if (prevKey === null) {
							this.toRender.areas.push(
								<path
									key={`chart-area_${ key }`}
									className={`${ styles.area }${ isFaded ? (` ${ styles.faded}`) : '' }`}
									style={{ fill: colors.get(key) }}
									d={`${ charts[key].path } V ${ offsetTop + chartHeight } H ${ charts[key].coordinates[0][0] } V ${ charts[key].coordinates[0][1] }`}
								/>
							);
						} else {
							const prevChart = charts[prevKey];

							this.toRender.areas.push(
								<path
									key={`chart-area_${ key }`}
									className={`${ styles.area }${ isFaded ? (` ${ styles.faded}`) : '' }`}
									style={{ fill: colors.get(key) }}
									d={`${ charts[key].path } V ${ prevChart.coordinates[prevChart.coordinates.length - 1][1] }${ prevChart.coordinates.reduce((memo, [x, y]) => `L ${ x } ${ y } ${ memo }`, '') } V ${ prevChart.coordinates[0][1] }`}
								/>
							);
						}
					}

					const reversedKey = metrics[metrics.length - 1 - i];
					let legendItemStyleName = styles.legend__item;
					const isDisabled = disabledMetrics.includes(reversedKey);

					if (isDisabled) {
						legendItemStyleName += ` ${ styles.legend__item_disabled }`;
					}

					this.toRender.legend.push(
						<span
							key={`legend_${ reversedKey }`}
							className={legendItemStyleName}
							onClick={this.toggleMetric.bind(this, reversedKey)}
							onMouseOver={isDisabled ? null : this.deferredHighlightMetric.bind(this, reversedKey)}
							onMouseLeave={isDisabled ? null : this.deferredHighlightMetric.bind(this, null)}
						>
							<span
								className={styles.legend__color}
								style={{ background: colors.get(reversedKey) }}
							/>
							{ labels.has(reversedKey) ? labels.get(reversedKey) : reversedKey }
						</span>
					);
				}
			}

			this.pointsIndicies = `${ firstPointIndex },${ data.length - 1 }`;
		}

		if (xStep !== null) {
			let ticksStep;

			switch (selectedTimeWindow){
				case '1 мин.':
					ticksStep = 10;
					break;

				case '5 мин.':
					ticksStep = 60;
					break;

				case '15 мин.':
					ticksStep = 180;
					break;
			}

			const _timeEnd = timeStart + timeDiff;
			let currentTick = Math.ceil(timeStart / ticksStep) * ticksStep;

			while (currentTick <= _timeEnd) {
				this.ticks.push({
					x: offsetLeft + (currentTick - timeStart) * xStep,
					y: height - offsetBottom + 3 * tickSize,
					label: new Date(currentTick * 1000).toLocaleString('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false
					})
				});

				currentTick += ticksStep;
			}
		}

		this.timeWindowControls = [];

		TimeWindows.forEach((tw, key) => {
			let className = styles.timewindow__item;
			let onClick = null;

			if (key === selectedTimeWindow) {
				className += ` ${ styles.timewindow__item_selected }`;
			} else {
				onClick = this.selectTimeWindow.bind(null, key);
			}

			this.timeWindowControls.push(
				<div
					key={key}
					className={className}
					onClick={onClick}
				>
					{ key }
				</div>
			);
		});

		let backDndAllowed = false;
		let forwardDndAllowed = false;

		if (this.dndAllowed) {
			const pointsIndicies = (
				dndPointsIndicies !== null ? dndPointsIndicies : this.pointsIndicies
			).split(',');

			if (pointsIndicies[0] > 0) {
				backDndAllowed = true;
			}

			if (pointsIndicies[1] < data.length - 1) {
				forwardDndAllowed = true;
			}
		}

		this.dndControls = [
			<div
				key={0}
				className={`${ styles['dnd-controls__control'] }${ backDndAllowed ? '' : (` ${ styles['dnd-controls__control_disabled']}`) }`}
				title="Нажмите, чтобы просмотреть самые старые данные"
				onClick={backDndAllowed ? this.emulateDnd.bind(this, -1, true) : null}
			>
				&#171;
			</div>,
			<div
				key={1}
				className={`${ styles['dnd-controls__control'] }${ backDndAllowed ? '' : (` ${ styles['dnd-controls__control_disabled']}`) }`}
				title={`Нажмите, чтобы вернуться к ${selectedTimeWindow}`}
				onClick={backDndAllowed ? this.emulateDnd.bind(this, -1, false) : null}
			>
				&#8249;
			</div>,
			<div
				key={2}
				className={`${ styles['dnd-controls__control'] }${ forwardDndAllowed ? '' : (` ${ styles['dnd-controls__control_disabled']}`) }`}
				title={`Нажмите, чтобы перейти к ${selectedTimeWindow}`}
				onClick={forwardDndAllowed ? this.emulateDnd.bind(this, 1, false) : null}
			>
				&#8250;
			</div>,
			<div
				key={3}
				className={`${ styles['dnd-controls__control'] }${ forwardDndAllowed ? '' : (` ${ styles['dnd-controls__control_disabled']}`) }`}
				title="Нажмите, чтобы вернуться к интерактивному режиму"
				onClick={forwardDndAllowed ? this.emulateDnd.bind(this, 1, true) : null}
			>
				&#187;
			</div>
		];

		if (Object.keys(nextState).length > 0) {
			this.setState(nextState);
		}
	}

	selectTimeWindow(key){
		appsettings.setSetting('timeWindow', key);
	}

	render(){
		const { colors, labels } = this.props;
		const {
			mouseOffsetX,
			dndIsInProgress,
			dndPointsIndicies
		} = this.state;
		const {
			width, height,
			offsetLeft, offsetTop, offsetBottom, offsetRight,
			textOffset, tickSize
		} = chartDimensions;
		const chartWidth = width - offsetLeft - offsetRight;
		const chartHeight = height - offsetTop - offsetBottom;
		const xAxisY = height - offsetBottom;

		let activePoint;
		let cursorLineTransform = null;

		if (mouseOffsetX !== null) {
			for (let i = 0; i < this.points.length; i++) {
				const point = this.points[i];

				if (point.x === mouseOffsetX) {
					activePoint = point;

					break;
				} else if (point.x > mouseOffsetX) {
					const prevPoint = this.points[i - 1];

					if (
						!prevPoint ||
						point.x - mouseOffsetX <= mouseOffsetX - prevPoint.x
					) {
						activePoint = point;
					} else {
						activePoint = prevPoint;
					}

					break;
				}
			}
		}

		let mouseTrackerClass = `${ styles['mouse-tracker'] }${ this.dndAllowed ? (` ${ styles['mouse-tracker_drag']}`) : '' }`;

		if (dndIsInProgress) {
			mouseTrackerClass += ` ${ styles['mouse-tracker_dragging'] }`;
		} else if (activePoint) {
			this.toRender.tooltipPoints = [];
			colors.forEach((color, key) => {
				if (key in activePoint.values) {
					this.toRender.tooltipPoints.push(
						<div
							key={`tooltip_${ key }`}
							className={styles.tooltip__point}
						>
							<div
								className={styles.tooltip__value}
								style={{ color }}
							>
								{ activePoint.values[key] }
							</div>
							<div className={styles.tooltip__metric}>
								{ labels.has(key) ? labels.get(key) : key }
							</div>
						</div>
					);
				}
			});

			cursorLineTransform = `translate(${ activePoint.x })`;
		}

		return (
			<div className={styles.container}>
				<div className={styles['dnd-controls']}>{ this.dndControls }</div>
				<div className={styles.timewindow}>{ this.timeWindowControls }</div>

				{
					activePoint ? (
						<div
							className={styles.tooltip}
							style={activePoint.x > chartWidth / 2 ? {
								right: `${ width - activePoint.x + 8 }px`
							} : {
								left: `${ activePoint.x + 8 }px`
							}}
						>
							{ this.toRender.tooltipPoints }

							<div
								key="tooltip__time"
								className={styles.tooltip__time}
							>
								{
									new Date(activePoint._ts * 1000).toLocaleString('en-US', {
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit',
										hour12: false
									})
								}
							</div>
						</div>
					)
						: null
				}

				<div
					className={mouseTrackerClass}
					style={{
						width: `${ chartWidth }px`,
						height: `${ chartHeight }px`,
						top: `${ offsetTop }px`,
						left: `${ offsetLeft }px`
					}}
					onMouseMove={this.onMouseMove}
					onMouseLeave={this.onMouseLeave}
					onMouseDown={this.dndAllowed ? this.onMouseDown : null}
					onMouseUp={this.dndAllowed ? this.onMouseUp : null}
				/>

				<svg
					version="1.1"
					baseProfile="full"
					width={`${ width }`}
					height={`${ height }`}
					xmlns="http://www.w3.org/2000/svg"
					className={styles.svg}
				>
					<path
						className={styles['x-axis']}
						d={this.ticks.reduce((memo, tick) => `${ memo }${ memo ? ' ' : '' }M ${ tick.x } ${ xAxisY } V ${ xAxisY + tickSize }`, '')}
					/>
					<text
						className={styles['y-label']}
						x={offsetLeft - textOffset}
						y={height - offsetBottom}
					>
						0
					</text>
					<line
						className={styles['x-axis']}
						x1={offsetLeft}
						x2={offsetLeft + chartWidth}
						y1={xAxisY}
						y2={xAxisY}
					/>
					<line
						className={styles['cursor-line']}
						x1="0"
						x2="0"
						y1={offsetTop - 10}
						y2={offsetTop + chartHeight + 6}
						transform={cursorLineTransform}
						style={{
							opacity: activePoint ? 1 : 0
						}}
					/>

					{ this.ticks.map(({ x, y, label }, i) => (
						<text
							key={i}
							className={styles['x-label']}
							x={x}
							y={y}
						>
							{ label }
						</text>
					)
					) }

					{ this.toRender.yMax }
					{ this.toRender.yMid }
					{ this.toRender.charts }
					{ this.toRender.areas }
				</svg>
				<div className={styles.legend}>{ this.toRender.legend }</div>
			</div>
		);
	}
}

Chart.defaultProps = {
	labels: new Map()
};
