/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import styles from './style.css';

export default class Disclaimer extends React.Component {
	constructor() {
		super();
		this.state = {
			opened: true
		};

		this.close = this.close.bind(this);
	}

	close() {
		this.setState({
			opened: false
		});
	}

	render() {
		if (this.state.opened === false) {
			return null;
		}

		return (<div className={ styles.disclaimer }>
			<div className={ styles['disclaimer-close'] } onClick={this.close}>x</div>
			<div className={ styles['disclaimer-content'] }>
				Below is the example of the NGINX Plus live activity monitoring. This page collects real time data from a demo instance of NGINX Plus.<br />
				Swagger UI for the API module is available on <a href="https://demo.nginx.com/swagger-ui/">https://demo.nginx.com/swagger-ui/</a><br />
				For more information on configuration please visit <a href="https://www.nginx.com/resources/admin-guide/logging-and-monitoring/">https://www.nginx.com/resources/admin-guide/logging-and-monitoring/</a><br />
				For purchasing NGINX Plus please contact the sales team: <a href="https://www.nginx.com/contact-sales/">https://www.nginx.com/contact-sales/</a>
			</div>
		</div>);
	}
};
