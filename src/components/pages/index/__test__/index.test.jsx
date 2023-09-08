/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import Index from '../index.jsx';
import styles from '../style.css';

describe('<Index />', () => {
	it('render()', () => {
		const wrapper = shallow(<Index />);
		const rows = wrapper.find(`.${ styles.row }`);

		// rows length
		expect(rows).toHaveLength(2);
		// AboutAngie className
		expect(rows.at(0).find('AboutAngie_binded').prop('className')).toBe(styles.box);
		// Connections className
		expect(rows.at(0).find('Connections_binded').prop('className')).toBe(styles.connections);
		// row 2 className
		expect(rows.at(1).prop('className')).toBe(`${ styles.row } ${ styles['row-wrap'] }`);
		// ServerZones
		expect(rows.at(1).find('ServerZones_binded')).toHaveLength(1);

		wrapper.unmount();
	});
});
