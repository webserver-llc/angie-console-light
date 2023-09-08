import React from 'react';
import { shallow } from 'enzyme';
import tooltips from '#/tooltips/index.jsx';
import ExpandableTable from '../expandabletable.jsx';
import styles from '../style.css';

describe('<ExpandableTable>', () => {
	let wrapper; let
		instance;
	const expandableItems = ['orange', 'blue', 'yellow'];

	beforeEach(() => {
		jest.spyOn(ExpandableTable.prototype, 'getExpandableItems').mockClear().mockImplementation(() => expandableItems);
		jest.spyOn(ExpandableTable.prototype, 'hasExpandable').mockClear().mockImplementation((name) => expandableItems.indexOf(name) !== -1);
		wrapper = shallow(<ExpandableTable />);
		instance = wrapper.instance();
	});

	afterEach(() => {
		ExpandableTable.prototype.getExpandableItems.mockRestore();
		ExpandableTable.prototype.hasExpandable.mockRestore();
		wrapper.unmount();
	});

	it('constructor()', () => {
		expect(wrapper.instance().state).toEqual({
			expandingItems: []
		});
	});

	it('toogleExpandingItemState()', () => {
		instance.toogleExpandingItemState(expandableItems[0]);
		// add first element
		expect(wrapper.state('expandingItems')).toEqual([expandableItems[0]]);

		instance.toogleExpandingItemState(expandableItems[1]);
		// add second element
		expect(wrapper.state('expandingItems')).toEqual([expandableItems[0], expandableItems[1]]);

		instance.toogleExpandingItemState(expandableItems[2]);
		// add third element
		expect(wrapper.state('expandingItems')).toEqual(expandableItems);

		instance.toogleExpandingItemState(expandableItems[1]);
		// remove item
		expect(wrapper.state('expandingItems')).toEqual(expandableItems.filter(item => item !== expandableItems[1]));
	});

	it('handleClickExpandingAll()', () => {
		instance.handleClickExpandingAll();
		// all expandable items
		expect(wrapper.state('expandingItems')).toEqual(expandableItems);

		instance.handleClickExpandingAll();
		// empty list
		expect(wrapper.state('expandingItems')).toEqual([]);
	});

	it('isExpandingAll()', () => {
		// without expanding all elements
		expect(instance.isExpandingAll()).toBe(false);

		wrapper.setState({ expandingItems: expandableItems });
		// all element is selected
		expect(instance.isExpandingAll()).toBe(true);
	});

	it('isExpandingItem()', () => {
		// without expanding element
		expect(instance.isExpandingItem(expandableItems[1])).toBe(false);

		wrapper.setState({ expandingItems: [expandableItems[1], expandableItems[2]] });
		// element is selected
		expect(instance.isExpandingItem(expandableItems[1])).toBe(true);
		// element is selected
		expect(instance.isExpandingItem(expandableItems[2])).toBe(true);
		// element isn't selected
		expect(instance.isExpandingItem(expandableItems[3])).toBe(false);
	});

	it('renderExpandingItemToogleIcon()', () => {
		let toogleElement;

		toogleElement = shallow(instance.renderExpandingItemToogleIcon(expandableItems[1]));
		expect(toogleElement.type()).toBe('td');
		toogleElement.unmount();

		wrapper.setState({ expandingItems: [expandableItems[1]] });
		toogleElement = shallow(instance.renderExpandingItemToogleIcon(expandableItems[1]));
		expect(toogleElement.prop('className')).toBe(styles['expanding-item-control']);
		expect(toogleElement.children().text()).toBe('▴');
		toogleElement.unmount();

		toogleElement = shallow(instance.renderExpandingItemToogleIcon(expandableItems[2]));
		expect(toogleElement.children().text()).toBe('▾');
		toogleElement.unmount();

		ExpandableTable.prototype.getExpandableItems.mockRestore();
		ExpandableTable.prototype.hasExpandable.mockRestore();
		wrapper.unmount();
		wrapper = shallow(<ExpandableTable />);
		instance = wrapper.instance();
		expect(instance.renderExpandingItemToogleIcon(expandableItems[1])).toBeNull();
		jest.spyOn(ExpandableTable.prototype, 'getExpandableItems').mockClear().mockImplementation(() => expandableItems);
		jest.spyOn(ExpandableTable.prototype, 'hasExpandable').mockClear().mockImplementation((name) => expandableItems.indexOf(name) !== -1);
	});

	it('renderExpandingAllControl()', () => {
		let control;
		const spyHandleClickExpandingAll = jest.spyOn(instance, 'handleClickExpandingAll').mockClear();
		jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
			prop_from_useTooltip: true
		}));

		control = shallow(instance.renderExpandingAllControl());
		expect(control.children().text()).toBe('▾');
		control.unmount();

		wrapper.setState({ expandingItems: expandableItems });
		control = shallow(instance.renderExpandingAllControl());
		expect(control.children().text()).toBe('▴');
		control.simulate('click');
		expect(spyHandleClickExpandingAll).toHaveBeenCalledTimes(1);
		// useTooltip call args
		expect(tooltips.useTooltip).toHaveBeenCalledWith('Show all exsists shards', 'hint-right');
		control = shallow(instance.renderExpandingAllControl());
		expect(control.children().text()).toBe('▾');
		control.unmount();
		tooltips.useTooltip.mockRestore();
		spyHandleClickExpandingAll.mockRestore();
	});
});
