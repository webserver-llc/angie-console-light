/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { UpstreamsBox, Upstreams } from '../upstreams.jsx';
import styles from '../style.css';

describe('<UpstreamsBox IndexPage />', () => {
	it('render()', () => {
		const props = {
			title: 'test_title',
			stats: {
				total: 99,
				warnings: 0,
				alerts: 1,
				servers: {
					all: 3,
					up: 3,
					failed: 0
				}
			},
			status: 'ok',
			href: '#test_block'
		};
		const wrapper = shallow(<UpstreamsBox { ...props } />);
		let indexBox = wrapper.find('IndexBox');

		expect(indexBox.prop('title'), 'IndexBox title').to.be.equal('test_title');
		expect(indexBox.prop('status'), 'IndexBox status').to.be.equal('ok');
		expect(indexBox.prop('href'), 'IndexBox href').to.be.equal('#test_block');

		indexBox = indexBox.childAt(0);

		expect(indexBox.childAt(0).name(), 'AlertsCount').to.be.equal('AlertsCount');
		expect(indexBox.childAt(0).prop('total'), 'AlertsCount total').to.be.equal(99);
		expect(indexBox.childAt(0).prop('warnings'), 'AlertsCount warnings').to.be.equal(0);
		expect(indexBox.childAt(0).prop('alerts'), 'AlertsCount alerts').to.be.equal(1);
		expect(indexBox.childAt(0).prop('href'), 'AlertsCount href').to.be.equal('#test_block');
		expect(indexBox.childAt(2).text(), 'all / up row').to.be.equal('All: 3 / Up: 3');
		expect(indexBox.childAt(3).prop('className'), 'failed row className').to.be.an('undefined');
		expect(indexBox.childAt(3).text(), 'failed row').to.be.equal('Failed: 0');

		props.stats.servers.up = 2;
		props.stats.servers.failed = 1;
		wrapper.setProps(props);
		indexBox = wrapper.find('IndexBox').childAt(0);

		expect(indexBox.childAt(2).text(), 'all / up row').to.be.equal('All: 3 / Up: 2');
		expect(indexBox.childAt(3).prop('className'), 'failed row className').to.be.equal(styles['red']);
		expect(indexBox.childAt(3).text(), 'failed row').to.be.equal('Failed: 1');

		wrapper.unmount();
	});
});

describe('<Upstreams IndexPage />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<Upstreams
				data={{
					upstreams: {
						__STATS: 'test_stats'
					}
				}}
				store={{
					__STATUSES: {
						upstreams: {
							status: 'ok'
						}
					}
				}}
			/>
		);
		const box = wrapper.find('UpstreamsBox');

		expect(box.prop('title'), 'UpstreamsBox title').to.be.equal('HTTP Upstreams');
		expect(box.prop('stats'), 'UpstreamsBox stats').to.be.equal('test_stats');
		expect(box.prop('status'), 'UpstreamsBox status').to.be.equal('ok');
		expect(box.prop('href'), 'UpstreamsBox href').to.be.equal('#upstreams');

		wrapper.unmount();
	});
});
