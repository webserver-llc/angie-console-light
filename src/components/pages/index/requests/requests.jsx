/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import IndexBox from '../indexbox/indexbox.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import calculateRequests from '../../../../calculators/requests.js';
import styles from '../connections/style.css';

export class Requests extends React.Component {
	render() {
		const { data: { requests } } = this.props;

		return (<IndexBox className={this.props.className}>
			<span styleName="counter">Total:{ requests.total }</span>
			<h3 styleName="h3">Requests</h3>

			{
				<table styleName="table">
					<tr>
						<th>Current</th>
						<th>Req/s</th>
					</tr>
					<tr>
						<td>{ requests.current }</td>
						<td>{ requests.reqs }</td>
					</tr>
				</table>
			}
		</IndexBox>);
	}
}

export default DataBinder(Requests, [
	api.http.requests.process(calculateRequests)
]);
