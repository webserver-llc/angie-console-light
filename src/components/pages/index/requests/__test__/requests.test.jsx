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
import { Requests } from '../requests.jsx';
import styles from '../../connections/style.css';

describe('<Requests IndexPage />', () => {
	it('render()', () => {
		const wrapper = shallow(
			<Requests
				className="test_class"
				data={{
					requests: {
						total: 1000,
						current: 999,
						reqs: 103
					}
				}}
			/>
		);
		let indexBox = wrapper.find('IndexBox');

		// IndexBox className from props
		expect(indexBox.prop('className')).toBe('test_class');

		indexBox = indexBox;

		// total row, className
		expect(indexBox.childAt(0).prop('className')).toBe(styles.counter);
		// total row, text
		expect(indexBox.childAt(0).text()).toBe('Total:1000');
		// table
		expect(indexBox.childAt(2).type()).toBe('table');
		// table className
		expect(indexBox.childAt(2).prop('className')).toBe(styles.table);
		// table, row 1 children length
		expect(indexBox.childAt(2).childAt(0).children()).toHaveLength(2);
		// table, row 2, cell 1 text
		expect(indexBox.childAt(2).childAt(1).childAt(0).text()).toBe('999');
		// table, row 2, cell 2 text
		expect(indexBox.childAt(2).childAt(1).childAt(1).text()).toBe('103');

		wrapper.unmount();
	});
});
