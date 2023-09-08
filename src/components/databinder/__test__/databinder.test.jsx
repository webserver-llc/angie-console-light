/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import DataBinder from '../databinder.jsx';
import datastore from '../../../datastore';
import { STORE } from '../../../datastore/store.js';

describe('DataBinder()', () => {
	class TestComponent extends React.Component {
		render() {
			return <div />;
		}
	}
	const apis = [ 'api_1', 'api_2' ];
	let dataResult = {
		api_1: null,
		api_2: null
	};

	beforeAll(() => {
		jest.spyOn(datastore.subscribe, 'apply').mockClear().mockImplementation(() => {});
		jest.spyOn(datastore, 'unsubscribe').mockClear().mockImplementation(() => {});
		jest.spyOn(datastore, 'get').mockClear().mockImplementation(() => dataResult);
	});

	beforeEach(() => {
		datastore.subscribe.apply.mockClear();
		datastore.unsubscribe.mockClear();
		datastore.get.mockClear();
	});

	afterAll(() => {
		datastore.subscribe.apply.mockRestore();
		datastore.unsubscribe.mockRestore();
		datastore.get.mockRestore();
	});

	it('provides class name', () => {
		const Component = DataBinder(TestComponent);

		// class name
		expect(Component.name).toBe('TestComponent_binded');
	});

	it('constructor()', () => {
		const Component = DataBinder(TestComponent);
		const wrapper = shallow(<Component />);

		const bindSpy = jest.spyOn(Component.prototype.forceUpdate, 'bind').mockClear();

		wrapper.instance().constructor();

		// forceUpdate.bind called once
		expect(bindSpy).toHaveBeenCalled();
		// forceUpdate.bind 1st arg
		expect(bindSpy.mock.calls[0][0] instanceof Component).toBe(true);

		bindSpy.mockRestore();

		wrapper.unmount();
	});

	it('componentWillMount() no apis', () => {
		const Component = DataBinder(TestComponent);
		const wrapper = shallow(<Component />);

		// subscribe.apply called once
		expect(datastore.subscribe.apply).toHaveBeenCalled();
		expect(datastore.subscribe.apply.mock.calls[0][0]).toBeNull();
		// subscribe.apply 2nd arg type
		expect(datastore.subscribe.apply.mock.calls[0][1]).toBeInstanceOf(Array);
		// subscribe.apply 2nd arg length
		expect(datastore.subscribe.apply.mock.calls[0][1]).toHaveLength(1);
		// subscribe.apply 2nd arg name
		expect(datastore.subscribe.apply.mock.calls[0][1][0]).toBe(wrapper.instance().forceUpdate);

		wrapper.unmount();
	});

	it('componentWillMount() with apis', () => {
		const Component = DataBinder(TestComponent, apis);
		const wrapper = shallow(<Component />);

		// subscribe.apply called once
		expect(datastore.subscribe.apply).toHaveBeenCalled();
		expect(datastore.subscribe.apply.mock.calls[0][0]).toBeNull();
		// subscribe.apply 2nd arg type
		expect(datastore.subscribe.apply.mock.calls[0][1]).toBeInstanceOf(Array);
		// subscribe.apply 2nd arg length
		expect(datastore.subscribe.apply.mock.calls[0][1]).toHaveLength(2);
		// subscribe.apply 1st arg name
		expect(datastore.subscribe.apply.mock.calls[0][1][0]).toEqual(apis);
		// subscribe.apply 2nd arg name
		expect(datastore.subscribe.apply.mock.calls[0][1][1]).toBe(wrapper.instance().forceUpdate);

		wrapper.unmount();
	});

	it('componentWillUnmount()', () => {
		const Component = DataBinder(TestComponent, apis);
		const wrapper = shallow(<Component />);

		wrapper.unmount();

		// datastore.unsubscribe called once
		expect(datastore.unsubscribe).toHaveBeenCalled();
		// datastore.unsubscribe 1st arg
		expect(datastore.unsubscribe.mock.calls[0][0]).toEqual(apis);
	});

	describe('render()', () => {
		([
			{
				title: 'no apis',
				args: [ TestComponent ]
			}, {
				title: 'no apis, ignoreEmpty param = true',
				args: [ TestComponent, [], { ignoreEmpty: true } ]
			}, {
				title: 'ignoreEmpty param = true',
				args: [ TestComponent, apis, { ignoreEmpty: true } ]
			}
		]).forEach(({ title, args }) => {
			it(title, () => {
				const Component = DataBinder(...args);
				const wrapper = shallow(<Component />);
				const shallowRender = wrapper.find('TestComponent');

				// get not called
				expect(datastore.get).not.toHaveBeenCalled();
				// TestComponent length
				expect(shallowRender.length).toBe(1);
				// TestComponent props
				expect(shallowRender.props()).toEqual({
					children: [],
					data: null,
					store: STORE
				});

				wrapper.unmount();
			});
		});

		it('with null apis', () => {
			const Component = DataBinder(TestComponent, apis);
			const wrapper = shallow(<Component />);
			const shallowRender = wrapper.find('TestComponent');

			// get called once
			expect(datastore.get).toHaveBeenCalled();
			// get 1st arg
			expect(datastore.get.mock.calls[0][0]).toEqual(apis);
			// Component length
			expect(wrapper.length).toBe(0);
			// TestComponent length
			expect(shallowRender.length).toBe(0);

			wrapper.unmount();
		});

		([
			{
				title: 'mixed apis',
				_dataResult: {
					api_1: {}
				}
			}, {
				title: 'normal apis',
				_dataResult: {
					api_1: {},
					api_2: {}
				}
			}
		]).forEach(({ title, _dataResult }) => {
			it(title, () => {
				const origDataResult = { ...dataResult };

				dataResult = _dataResult;

				const Component = DataBinder(TestComponent, apis);
				const wrapper = shallow(<Component />);
				const shallowRender = wrapper.find('TestComponent');

				// get called once
				expect(datastore.get).toHaveBeenCalled();
				// get 1st arg
				expect(datastore.get.mock.calls[0][0]).toEqual(apis);
				// TestComponent length
				expect(shallowRender.length).toBe(1);
				// TestComponent props
				expect(shallowRender.props()).toEqual({
					children: [],
					data: dataResult,
					store: STORE
				});

				dataResult = origDataResult;

				wrapper.unmount();
			});
		});

		it('passing the props', () => {
			const Component = DataBinder(TestComponent, []);
			const wrapper = shallow(
				<Component
					test_prop
					number_test_prop={1234}
				/>
			);
			const shallowRender = wrapper.find('TestComponent');

			// get not called
			expect(datastore.get).not.toHaveBeenCalled();
			// TestComponent length
			expect(shallowRender.length).toBe(1);
			// TestComponent props
			expect(shallowRender.props()).toEqual({
				children: [],
				data: null,
				store: STORE,
				test_prop: true,
				number_test_prop: 1234
			});

			wrapper.unmount();
		});
	});
});
