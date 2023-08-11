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
		const rows = wrapper.find(`.${ styles['row'] }`);

		expect(rows, 'rows length').to.have.lengthOf(2);
		expect(rows.at(0).find('AboutAngie_binded').prop('className'), 'AboutAngie className')
			.to.be.equal(styles['box']);
		expect(rows.at(0).find('Connections_binded').prop('className'), 'Connections className')
			.to.be.equal(styles['connections']);
		expect(rows.at(1).prop('className'), 'row 2 className')
			.to.be.equal(`${ styles['row'] } ${ styles['row-wrap'] }`);
		expect(rows.at(1).find('ServerZones_binded'), 'ServerZones').to.have.lengthOf(1);

		wrapper.unmount();
	});
});
