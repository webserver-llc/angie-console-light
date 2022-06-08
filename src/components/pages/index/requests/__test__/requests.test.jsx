/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
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

		expect(indexBox.prop('className'), 'IndexBox className from props').to.be.equal('test_class');

		indexBox = indexBox;

		expect(indexBox.childAt(0).prop('className'), 'total row, className').to.be.equal(styles['counter']);
		expect(indexBox.childAt(0).text(), 'total row, text').to.be.equal('Total:1000');
		expect(indexBox.childAt(2).type(), 'table').to.be.equal('table');
		expect(indexBox.childAt(2).prop('className'), 'table className').to.be.equal(styles['table']);
		expect(
			indexBox.childAt(2).childAt(0).children(),
			'table, row 1 children length'
		).to.have.lengthOf(2);
		expect(
			indexBox.childAt(2).childAt(1).childAt(0).text(),
			'table, row 2, cell 1 text'
		).to.be.equal('999');
		expect(
			indexBox.childAt(2).childAt(1).childAt(1).text(),
			'table, row 2, cell 2 text'
		).to.be.equal('103');

		wrapper.unmount();
	});
});
