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
import calculateHttpLimitConn from '../../../calculators/httplimitconn.js';
import calculateHttpLimitReq from '../../../calculators/httplimitreq.js';
import ServerZones from './serverzones.jsx';
import Locations from './locationzones.jsx';
import LimitConn from './limitconn.jsx';
import LimitReq from './limitreq.jsx';

export class HTTPZones extends React.Component {
	render() {
		const { data: {
			server_zones,
			location_zones,
			limit_conns,
			limit_reqs
		} } = this.props;

		return (
			<div>
				<ServerZones data={ server_zones } />
				<br/>
				<Locations data={ location_zones } />
				<br/>
				<LimitConn data={ limit_conns } />
				<br/>
				<LimitReq data={ limit_reqs } />
			</div>
		);
	}
}

export default DataBinder(HTTPZones, [
	api.http.server_zones.process(calculateServerZones),
	api.http.location_zones.process(calculateLocationZones),
	api.http.limit_conns.process(calculateHttpLimitConn),
	api.http.limit_reqs.process(calculateHttpLimitReq)
]);
