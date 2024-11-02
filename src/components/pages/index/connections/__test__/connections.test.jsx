/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import { shallow } from 'enzyme';
import { Connections } from '../connections.jsx';
import styles from '../style.css';

describe('<Connections IndexPage />', () => {
	const data = {
		connections: {},
		ssl: {}
	};

	it('constructor()', () => {
		const wrapper = shallow(<Connections data={data} />);

		expect(wrapper.state('tab')).toBe('conns');

		wrapper.unmount();
	});

	it('changeTab()', () => {
		const wrapper = shallow(<Connections data={data} />);
		const instance = wrapper.instance();
		const stateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.changeTab('some_tab');

		// this.setState called once
		expect(stateSpy).toHaveBeenCalledTimes(1);
		// this.setState arg
		expect(stateSpy.mock.calls[0][0]).toEqual({
			tab: 'some_tab'
		});

		stateSpy.mockRestore();
		wrapper.unmount();
	});

	it('getCurrentCell()', () => {
		const wrapper = shallow(<Connections data={data} />);
		const instance = wrapper.instance();
		let cell = instance.getCurrentCell('not_a_number');

		// [value is a string] cell nodeName
		expect(cell.type).toBe('td');
		// [value is a string] cell child 1
		expect(cell.props.children[0]).toBe('not_a_number');

		cell = instance.getCurrentCell(125);

		// [value is a number] cell nodeName
		expect(cell.type).toBe('td');
		// [value is a number] cell child 1
		expect(cell.props.children[0]).toBe(125);
		// [value is a number] cell child 2 className
		expect(cell.props.children[1].props.className).toBe(styles.current__sec);

		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<Connections
				data={{
					connections: {
						accepted: 10,
						current: 99,
						accepted_s: 18,
						active: 72,
						idle: 0,
						dropped: 1
					},
					ssl: {
						handshakes: 20,
						handshakes_failed: 30,
						session_reuses: 4,
						handshakes_s: 200,
						handshakes_failed_s: 300,
						session_reuses_s: 40
					}
				}}
				className="test"
			/>
		);
		const instance = wrapper.instance();
		const changeTabBindSpy = jest.spyOn(instance.changeTab, 'bind').mockClear();

		instance.forceUpdate();

		const indexBox = wrapper.find('IndexBox');

		// IndexBox className
		expect(indexBox.prop('className')).toBe('test');
		// indexBox = indexBox.childAt(0);
		// IndexBox children length
		expect(indexBox.children()).toHaveLength(3);
		// [Conns tab] accepted block className
		expect(indexBox.childAt(0).prop('className')).toBe(styles.counter);
		// [Conns tab] accepted block text
		expect(indexBox.childAt(0).text()).toBe('Принято: 10');
		// [Conns tab] tabs className
		expect(indexBox.childAt(1).prop('className')).toBe(styles.tabs);
		// [Conns tab] Connections tab className
		expect(indexBox.childAt(1).childAt(0).prop('className')).toBe(styles['tab-active']);
		// [Conns tab] Connections tab onClick
		expect(indexBox.childAt(1).childAt(0).prop('onClick').name).toBe('bound changeTab');
		// [Conns tab] Connections tab text
		expect(indexBox.childAt(1).childAt(0).text()).toBe('Соединения');

		// changeTab called once
		expect(changeTabBindSpy).toHaveBeenCalledTimes(1);
		// changeTab call 1 arg 1
		expect(changeTabBindSpy.mock.calls[0][0]).toEqual(instance);
		// changeTab call 1 arg 2
		expect(changeTabBindSpy.mock.calls[0][1]).toBe('conns');

		// [Conns tab] table className
		expect(indexBox.childAt(2).prop('className')).toBe(styles.table);
		// [Conns tab] table row 1 children length
		expect(indexBox.childAt(2).childAt(0).children()).toHaveLength(5);
		// [Conns tab] table row 2 children 1
		expect(indexBox.childAt(2).childAt(1).childAt(0).text()).toBe('99');
		// [Conns tab] table row 2 children 2
		expect(indexBox.childAt(2).childAt(1).childAt(1).text()).toBe('18');
		// [Conns tab] table row 2 children 3
		expect(indexBox.childAt(2).childAt(1).childAt(2).text()).toBe('72');
		// [Conns tab] table row 2 children 4
		expect(indexBox.childAt(2).childAt(1).childAt(3).text()).toBe('0');
		// [Conns tab] table row 2 children 5
		expect(indexBox.childAt(2).childAt(1).childAt(4).text()).toBe('1');

		changeTabBindSpy.mockRestore();
		wrapper.unmount();
	});
});
