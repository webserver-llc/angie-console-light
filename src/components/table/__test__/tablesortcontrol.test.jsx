/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import TableSortControl from '../tablesortcontrol.jsx';
import styles from '../style.css';
import tooltips from '../../../tooltips/index.jsx';

describe('<TableSortControl />', () => {
	it('constructor()', () => {
		const toggleSpy = spy(TableSortControl.prototype.toggle, 'bind');
		const wrapper = shallow(<TableSortControl />);

		expect(toggleSpy.calledOnce, 'this.toggle.bind called').to.be.true;
		expect(
			toggleSpy.args[0][0] instanceof TableSortControl,
			'this.toggle.bind call arg'
		).to.be.true;

		toggleSpy.restore();
	});

	it('toggle()', () => {
		const onChangeSpy = spy();
		const wrapper = shallow(
			<TableSortControl
				order="desc"
				onChange={ onChangeSpy }
			/>
		);
		const instance = wrapper.instance();

		instance.toggle();

		expect(onChangeSpy.calledOnce, '[props.order = desc] props.onChange called').to.be.true;
		expect(
			onChangeSpy.calledWith('asc'),
			'[props.order = desc] props.onChange call args'
		).to.be.true;

		onChangeSpy.resetHistory();
		wrapper.setProps({ order: 'asc' });
		instance.toggle();

		expect(onChangeSpy.calledOnce, '[props.order = asc] props.onChange called').to.be.true;
		expect(
			onChangeSpy.calledWith('desc'),
			'[props.order = asc] props.onChange call args'
		).to.be.true;

		wrapper.unmount();
	});

	it('render()', () => {
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));

		const wrapper = shallow(
			<TableSortControl
				order="asc"
			/>
		);
		const instance = wrapper.instance();

		expect(wrapper.type(), 'wrapper html tag').to.be.equal('th');
		expect(wrapper.prop('rowSpan'), 'wrapper prop rowSpan').to.be.equal('2');
		expect(wrapper.prop('className'), 'wrapper prop className').to.be.equal(`${styles['sorter']} ${styles['sorterActive']}`);
		expect(wrapper.prop('onClick'), 'wrapper prop onClick').to.be.a('function');
		expect(wrapper.prop('onClick').name, 'wrapper prop onClick name').to.be.equal('bound toggle');
		expect(wrapper.prop('prop_from_useTooltip'), 'wrapper prop from useTooltip').to.be.true;
		expect(tooltips.useTooltip.calledOnce, 'useTooltip called').to.be.true;
		expect(
			tooltips.useTooltip.calledWith('Sort by status - failed first', 'hint-right'),
			'useTooltip call args'
		).to.be.true;
		expect(wrapper.text(), 'wrapper text').to.be.equal('▴');

		tooltips.useTooltip.resetHistory();
		wrapper.setProps({
			singleRow: true,
			order: 'desc'
		});

		expect(
			wrapper.prop('rowSpan'),
			'[prop.singleRow = true] wrapper prop rowSpan'
		).to.be.an.undefined;
		expect(
			tooltips.useTooltip.calledOnce,
			'[props.order = desc] useTooltip called'
		).to.be.true;
		expect(
			tooltips.useTooltip.calledWith('Sort by conf order', 'hint-right'),
			'[props.order = desc] useTooltip call args'
		).to.be.true;
		expect(wrapper.text(), 'wrapper text').to.be.equal('▾');

		tooltips.useTooltip.restore();
		wrapper.unmount();
	});
});
