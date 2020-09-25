/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export const UPSTREAM_GROUP_LENGTH = 70;

export default class UpstreamsContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showOnlyFailed: false,
			showUpstreamsList: false,
			editor: false
		};

		this.toggleFailed = this.toggleFailed.bind(this);
		this.toggleUpstreamsList = this.toggleUpstreamsList.bind(this);
		this.handleLastItemShowing = this.handleLastItemShowing.bind(this);

		if (this.initIntersectionObserver() === false) {
			this.state.howManyToShow = Infinity;
		} else {
			this.state.howManyToShow = UPSTREAM_GROUP_LENGTH;
		}
	}

	toggleFailed() {
		this.setState({
			showOnlyFailed: !this.state.showOnlyFailed
		});
	}

	toggleUpstreamsList() {
		this.setState({
			showUpstreamsList: !this.state.showUpstreamsList
		});
	}

	initIntersectionObserver() {
		if ('IntersectionObserver' in window) {
			this.intersectionObserver = new IntersectionObserver(this.handleLastItemShowing, {
				root: null,
				threshold: 0.3
			});

			return true;
		}

		return false;
	}

	handleLastItemShowing([entry]) {
		if (
			entry.isIntersecting &&
			isFinite(this.state.howManyToShow) &&
			this.state.howManyToShow < this.props.upstreams.size
		) {
			this.intersectionObserver.unobserve(entry.target);

			this.setState({
				howManyToShow: this.state.howManyToShow + UPSTREAM_GROUP_LENGTH
			});
		}
	}

	scrollTo(upstreamName, position) {
		this.setState({
			howManyToShow: position + UPSTREAM_GROUP_LENGTH
		}, () => {
			document.getElementById(`upstream-${upstreamName}`).scrollIntoView();
		});
	}

	upstreamRef(isLast, ref){
		if (isLast && this.intersectionObserver && ref) {
			this.intersectionObserver.observe(ref.base);
		}
	}

	render() {
		let children = [];
		let { upstreams } = this.props;
		const { __STATS } = upstreams;

		upstreams = Array.from(upstreams);

		let upstreamsToShow = upstreams;

		if (isFinite(this.state.howManyToShow)) {
			upstreamsToShow = upstreams.slice(0, this.state.howManyToShow);
		}

		upstreamsToShow.forEach(([name, upstream], i) => {
			if (this.state.showOnlyFailed && upstream.hasFailedPeer || !this.state.showOnlyFailed) {
				children.push(<this.props.component
					upstream={upstream}
					name={name}
					key={name}
					showOnlyFailed={this.state.showOnlyFailed}
					writePermission={this.props.writePermission}
					upstreamsApi={this.props.upstreamsApi}
					isStream={this.props.isStream}
					ref={ this.upstreamRef.bind(this, i == upstreamsToShow.length - 1) }
				/>);
			}
		});

		if (children.length === 0) {
			children = <div styleName="msg">
				All upstream servers appear to be just fine — nothing to show here.
				Toggle "Failed only" to show all upstreams.
			</div>;
		}

		return (<div styleName="upstreams-container">
			<span styleName="toggle-failed">
				Failed only
				<span
					styleName={this.state.showOnlyFailed ? 'toggler-active' : 'toggler'}
					onClick={this.toggleFailed}>
					<span styleName="toggler-point" />
				</span>
			</span>

			<h1>{ this.props.title }</h1>

			<span
				styleName={this.state.showUpstreamsList ? 'list-toggler-opened' : 'list-toggler'}
				onClick={this.toggleUpstreamsList}
			>
				{ this.state.showUpstreamsList ? 'Hide' : 'Show'} upstreams list
			</span>

			{
				this.state.showUpstreamsList ?
					<div styleName="upstreams-catalog">
						<div styleName="upstreams-summary">
							<strong>Total:</strong> { __STATS.total } upstreams
							({ __STATS.servers.all } servers)

							<span styleName="red-text">
								<strong>With problems:</strong> { __STATS.failures } upstreams
								({ __STATS.servers.failed } servers)
							</span>
						</div>

						<div styleName="upstreams-navlinks">
							{
								upstreams.map(([name, upstream], i) => {
									if (this.state.showOnlyFailed && upstream.hasFailedPeer || !this.state.showOnlyFailed) {
										return (
											<span
												onClick={() => this.scrollTo(name, i)}
												styleName={upstream.hasFailedPeer ? 'upstream-link-failed' : 'upstream-link'}
												key={name}
											>
												<span styleName="dashed">{name}</span>
											</span>
										);
									}
								})
							}
						</div>
					</div>
				: null
			}

			{ children }
		</div>);
	}
};
