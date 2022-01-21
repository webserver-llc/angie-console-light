/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import DataBinder from '../databinder.jsx';
import datastore from '../../../datastore';
import { STORE } from '../../../datastore/store.js';

describe('DataBinder()', () => {
	class TestComponent extends React.Component {
		render() {
			return <div />;
		}
	};
	const apis = [ 'api_1', 'api_2' ];
	let dataResult = {
		api_1: null,
		api_2: null
	};

	before(() => {
		stub(datastore.subscribe, 'apply').callsFake(() => {});
		stub(datastore, 'unsubscribe').callsFake(() => {});
		stub(datastore, 'get').callsFake(() => dataResult);
	});

	beforeEach(() => {
		datastore.subscribe.apply.resetHistory();
		datastore.unsubscribe.resetHistory();
		datastore.get.resetHistory();
	});

	after(() => {
		datastore.subscribe.apply.restore();
		datastore.unsubscribe.restore();
		datastore.get.restore();
	});

	it('provides class name', () => {
		const Component = DataBinder(TestComponent);

		expect(Component.name, 'class name').to.be.equal('TestComponent_binded');
	});

	it('constructor()', () => {
		const Component = DataBinder(TestComponent);
		const wrapper = shallow(<Component />);

		const bindSpy = spy(Component.prototype.forceUpdate, 'bind');

		wrapper.instance().constructor();

		expect(bindSpy.calledOnce, 'forceUpdate.bind called once').to.be.true;
		expect(bindSpy.args[0][0] instanceof Component, 'forceUpdate.bind 1st arg').to.be.true;

		bindSpy.restore();

		wrapper.unmount();
	});

	it('componentWillMount() no apis', () => {
		const Component = DataBinder(TestComponent);
		const wrapper = shallow(<Component />);

		expect(datastore.subscribe.apply.calledOnce, 'subscribe.apply called once').to.be.true;
		expect(datastore.subscribe.apply.args[0][0], 'subscribe.apply 1st arg').to.be.a('null');
		expect(datastore.subscribe.apply.args[0][1], 'subscribe.apply 2nd arg type').to.be.an.instanceof(Array);
		expect(datastore.subscribe.apply.args[0][1], 'subscribe.apply 2nd arg length').to.have.lengthOf(1);
		expect(datastore.subscribe.apply.args[0][1][0].name, 'subscribe.apply 2nd arg name')
			.to.be.equal('bound forceUpdate');

		wrapper.unmount();
	});

	it('componentWillMount() with apis', () => {
		const Component = DataBinder(TestComponent, apis);
		const wrapper = shallow(<Component />);

		expect(datastore.subscribe.apply.calledOnce, 'subscribe.apply called once').to.be.true;
		expect(datastore.subscribe.apply.args[0][0], 'subscribe.apply 1st arg').to.be.a('null');
		expect(datastore.subscribe.apply.args[0][1], 'subscribe.apply 2nd arg type').to.be.an.instanceof(Array);
		expect(datastore.subscribe.apply.args[0][1], 'subscribe.apply 2nd arg length').to.have.lengthOf(2);
		expect(datastore.subscribe.apply.args[0][1][0], 'subscribe.apply 1st arg name')
			.to.be.deep.equal(apis);
		expect(datastore.subscribe.apply.args[0][1][1].name, 'subscribe.apply 2nd arg name')
			.to.be.equal('bound forceUpdate');

		wrapper.unmount();
	});

	it('componentWillUnmount()', () => {
		const Component = DataBinder(TestComponent, apis);
		const wrapper = shallow(<Component />);

		wrapper.unmount();

		expect(datastore.unsubscribe.calledOnce, 'datastore.unsubscribe called once').to.be.true;
		expect(datastore.unsubscribe.args[0][0], 'datastore.unsubscribe 1st arg').to.be.deep.equal(apis);
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

				expect(datastore.get.notCalled, 'get not called').to.be.true;
				expect(shallowRender.length, 'TestComponent length').to.be.equal(1);
				expect(shallowRender.props(), 'TestComponent props').to.be.deep.equal({
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

			expect(datastore.get.calledOnce, 'get called once').to.be.true;
			expect(datastore.get.args[0][0], 'get 1st arg').to.be.deep.equal(apis);
			expect(wrapper.length, 'Component length').to.be.equal(0);
			expect(shallowRender.length, 'TestComponent length').to.be.equal(0);

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
				const origDataResult = Object.assign({}, dataResult);

				dataResult = _dataResult;

				const Component = DataBinder(TestComponent, apis);
				const wrapper = shallow(<Component />);
				const shallowRender = wrapper.find('TestComponent');

				expect(datastore.get.calledOnce, 'get called once').to.be.true;
				expect(datastore.get.args[0][0], 'get 1st arg').to.be.deep.equal(apis);
				expect(shallowRender.length, 'TestComponent length').to.be.equal(1);
				expect(shallowRender.props(), 'TestComponent props').to.be.deep.equal({
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
					test_prop={ true }
					number_test_prop={ 1234 }
				/>
			);
			const shallowRender = wrapper.find('TestComponent');

			expect(datastore.get.notCalled, 'get not called').to.be.true;
			expect(shallowRender.length, 'TestComponent length').to.be.equal(1);
			expect(shallowRender.props(), 'TestComponent props').to.be.deep.equal({
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
