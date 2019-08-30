/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import api from '../../../api';
import DataBinder from '../../databinder/databinder.jsx';
import calculateServerZones from '../../../calculators/serverzones.js';
import calculateLocationZones from '../../../calculators/locationzones.js';
import ServerZones from './serverzones.jsx';
import Locations from './locationzones.jsx';

export class HTTPZones extends React.Component {
	render() {
		const { data: {
			server_zones,
			location_zones
		} } = this.props;

		return (
			<div>
				<ServerZones data={ server_zones } />
				<br/>
				<Locations data={ location_zones } />
			</div>
		);
	}
}

export default DataBinder(HTTPZones, [
	api.http.server_zones.process(calculateServerZones),
	api.http.location_zones.process(calculateLocationZones)
]);
