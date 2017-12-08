/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
import React from 'react';
import api, { streamUpstreamsApi } from '../../../api';
import { upstreams as calculateStreamUpstreams } from '../../../calculators/stream.js';
import calculateSharedZones from '../../../calculators/sharedzones.js';
import UpstreamsContainer from '../../upstreams/upstreamscontainer.jsx';
import StreamUpstream from './streamupstream.jsx';
import DataBinder from '../../databinder/databinder.jsx';

export class StreamUpstreams extends React.Component {
	render() {
		const { data: { upstreams } } = this.props;

		return (
			<UpstreamsContainer
				title="TCP/UDP Upstreams"
				component={StreamUpstream}
				upstreams={upstreams}
				writePermission={streamUpstreamsApi.canWrite}
				upstreamsApi={streamUpstreamsApi}
				isStream={true}
			/>
		);
	}
}

export default DataBinder(StreamUpstreams, [
	api.slabs.process(calculateSharedZones),
	api.stream.upstreams.process(calculateStreamUpstreams)
]);
