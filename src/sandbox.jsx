
import React from 'react';
import Tooltip from './components/tooltip/tooltip.jsx';
import Progressbar from './components/progressbar/progressbar.jsx';
import GuageIndicator from './components/gaugeindicator/gaugeindicator.jsx';
import IndexBox from './components/pages/index/indexbox/indexbox.jsx';
import AlertsCount from './components/pages/index/alertscount/alertscount.jsx';

const el = document.createElement('div');

document.body.appendChild(el);


render(<div>
	{/*<Tooltip>11</Tooltip>*/}
	<Progressbar percentage={ 30 } />
	<GuageIndicator percentage={ 100 } />
	<GuageIndicator percentage={ 70 } />

	<IndexBox title="TCP Zones" status="warning">
		<AlertsCount total={4} alerts={0} />
	</IndexBox>

	<IndexBox title="Caches" status="warning">
		<AlertsCount total={1} alerts={0} warnings />
	</IndexBox>

</div>, el);

