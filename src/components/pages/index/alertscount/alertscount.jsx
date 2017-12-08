/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class AlertsCount extends React.Component {
	shouldComponentUpdate(nextProps) {
		return (
			this.props.total !== nextProps.total ||
			this.props.warnings !== nextProps.warnings ||
			this.props.alerts !== nextProps.alerts
		);
	}

	render() {
		const alertsTitle = this.props.alerts > 0 ? 'Alerts' : this.props.warnings > 0 ? 'Warnings' : 'Problems';
		const alertsStyleName = this.props.alerts > 0 ? 'alert' : this.props.warnings > 0 ? 'warning' : 'ok';

		return (
			<div styleName="alerts">
				<span styleName="num">
					<span styleName="label">Total</span>
					{ this.props.total }
				</span>
				/
				<a styleName={alertsStyleName} href={this.props.href}>
					<span styleName="label">{ alertsTitle }</span>
					{ this.props.alerts || this.props.warnings || 0 }
				</a>
			</div>
		);
	}
}