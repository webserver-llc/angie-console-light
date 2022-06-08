/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleschenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { spy, stub } from 'sinon';
import UpstreamsContainer, { UPSTREAM_GROUP_LENGTH } from '../upstreamscontainer.jsx';
import styles from '../style.css';

describe('<UpstreamsContainer />', () => {
	const props = {
		upstreams: new Map(),
		component(){}
	};

	it('constructor()', () => {
		const toggleFailedSpy = spy(UpstreamsContainer.prototype.toggleFailed, 'bind');
		const toggleUpstreamsListSpy = spy(UpstreamsContainer.prototype.toggleUpstreamsList, 'bind');
		const handleLastItemShowingSpy = spy(UpstreamsContainer.prototype.handleLastItemShowing, 'bind');
		let initIntObsResult = false;
		const initIntOsververStub = stub(UpstreamsContainer.prototype, 'initIntersectionObserver')
			.callsFake(() => initIntObsResult);
		let wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);

		expect(wrapper.state(), 'this.state').to.deep.equal({
			showOnlyFailed: false,
			showUpstreamsList: false,
			editor: false,
			howManyToShow: Infinity
		});
		expect(toggleFailedSpy.calledOnce, 'this.toggleFailed.bind called').to.be.true;
		expect(toggleFailedSpy.args[0][0] instanceof UpstreamsContainer, 'this.toggleFailed.bind arg').to.be.true;
		expect(toggleUpstreamsListSpy.calledOnce, 'this.toggleUpstreamsList.bind called').to.be.true;
		expect(toggleUpstreamsListSpy.args[0][0] instanceof UpstreamsContainer, 'this.toggleUpstreamsList.bind arg').to.be.true;
		expect(handleLastItemShowingSpy.calledOnce, 'this.handleLastItemShowing.bind called').to.be.true;
		expect(handleLastItemShowingSpy.args[0][0] instanceof UpstreamsContainer, 'this.handleLastItemShowing.bind arg').to.be.true;
		expect(initIntOsververStub.calledOnce, 'this.initIntersectionObserver called').to.be.true;

		initIntObsResult = true;
		wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);

		expect(
			wrapper.state('howManyToShow'),
			'[this.initIntersectionObserver() = true] this.state.howManyToShow'
		).to.be.equal(UPSTREAM_GROUP_LENGTH);

		initIntOsververStub.restore();
		handleLastItemShowingSpy.restore();
		toggleUpstreamsListSpy.restore();
		toggleFailedSpy.restore();
	});

	it('toggleFailed()', () => {
		const wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'setState').callsFake(() => {});

		instance.toggleFailed();

		expect(instance.setState.calledOnce, 'this.setState called').to.be.true;
		expect(instance.setState.args[0][0], 'this.setState arg').to.be.deep.equal({
			showOnlyFailed: true
		});

		instance.setState.restore();
		wrapper.unmount();
	});

	it('toggleUpstreamsList()', () => {
		const wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance, 'setState').callsFake(() => {});

		instance.toggleUpstreamsList();

		expect(instance.setState.calledOnce, 'this.setState called').to.be.true;
		expect(instance.setState.args[0][0], 'this.setState arg').to.be.deep.equal({
			showUpstreamsList: true
		});

		instance.setState.restore();
		wrapper.unmount();
	});

	it('initIntersectionObserver()', () => {
		const _IntersectionObserver = window.IntersectionObserver;

		delete window.IntersectionObserver;

		const wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);
		const instance = wrapper.instance();

		expect(instance.initIntersectionObserver(), 'IntersectionObserver not supported').to.be.false;
		expect(instance.intersectionObserver, 'this.intersectionObserver').to.be.an('undefined');

		window.IntersectionObserver = _IntersectionObserver;

		const intObserverSpy = spy(window, 'IntersectionObserver');

		expect(instance.initIntersectionObserver(), 'IntersectionObserver supported').to.be.true;
		expect(instance.intersectionObserver, 'this.intersectionObserver').to.be.an.instanceof(window.IntersectionObserver);
		expect(intObserverSpy.calledOnce, 'IntersectionObserver created').to.be.true;
		expect(intObserverSpy.args[0][0].name, 'IntersectionObserver arg 1').to.be.equal('bound handleLastItemShowing');
		expect(intObserverSpy.args[0][1], 'IntersectionObserver arg 2').to.be.deep.equal({
			root: null,
			threshold: 0.3
		});

		intObserverSpy.restore();
		wrapper.unmount();
	});

	it('handleLastItemShowing()', () => {
		const Component = () => {
			return (
				<div>Test</div>
			);
		};
		const wrapper = mount(
			<UpstreamsContainer
				{ ...props }
				component={ Component }
				upstreams={ new Map([
					['test_1', {}],
					['test_2', {}]
				]) }
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		stub(instance.intersectionObserver, 'unobserve').callsFake(() => {});

		instance.handleLastItemShowing([{}]);

		expect(
			instance.intersectionObserver.unobserve.notCalled,
			'[no isIntersecting] this.intersectionObserver.unobserve not called'
		).to.be.true;
		expect(
			setStateSpy.notCalled,
			'[no isIntersecting] this.setState not called'
		).to.be.true;

		wrapper.setState({ howManyToShow: Infinity });
		wrapper.update();
		setStateSpy.resetHistory();
		instance.handleLastItemShowing([{ isIntersecting: true }]);

		expect(
			instance.intersectionObserver.unobserve.notCalled,
			'[state.howManyToShow = Infinity] this.intersectionObserver.unobserve not called'
		).to.be.true;
		expect(
			setStateSpy.notCalled,
			'[state.howManyToShow = Infinity] this.setState not called'
		).to.be.true;

		wrapper.setState({ howManyToShow: 70 });
		wrapper.update();
		setStateSpy.resetHistory();
		instance.handleLastItemShowing([{ isIntersecting: true }]);

		expect(
			instance.intersectionObserver.unobserve.notCalled,
			'[upstreams.size < state.howManyToShow] this.intersectionObserver.unobserve not called'
		).to.be.true;
		expect(
			setStateSpy.notCalled,
			'[upstreams.size < state.howManyToShow] this.setState not called'
		).to.be.true;

		wrapper.setState({ howManyToShow: 1 });
		wrapper.update();
		setStateSpy.resetHistory();
		instance.handleLastItemShowing([{
			isIntersecting: true,
			target: 'test_target'
		}]);

		expect(instance.intersectionObserver.unobserve).to.be.calledOnce;
		expect(
			instance.intersectionObserver.unobserve.args[0][0],
			'this.intersectionObserver.unobserve call arg'
		).to.be.equal('test_target');
		expect(
			setStateSpy.calledOnce,
			'this.setState called once'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'this.setState call arg'
		).to.be.deep.equal({
			howManyToShow: 71
		});

		setStateSpy.restore();
		instance.intersectionObserver.unobserve.restore();
		wrapper.unmount();
	});

	it('scrollTo()', () => {
		const wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');
		const scrollIntoViewSpy = spy();

		stub(document, 'getElementById').callsFake(() => ({
			scrollIntoView: scrollIntoViewSpy
		}))

		instance.scrollTo('test_upstream', 3);

		expect(setStateSpy.calledOnce, 'this.setState called once').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call arg 1').to.be.deep.equal({
			howManyToShow: 73
		});
		expect(setStateSpy.args[0][1], 'this.setState call arg 2').to.be.a('function');

		setStateSpy.args[0][1]();

		expect(document.getElementById.calledOnce, 'document.getElementById called').to.be.true;
		expect(document.getElementById.args[0][0], 'document.getElementById call arg').to.be.equal('upstream-test_upstream');
		expect(scrollIntoViewSpy.calledOnce, 'scrollIntoView called').to.be.true;

		setStateSpy.restore();
		document.getElementById.restore();
		wrapper.unmount();
	});

	it('upstreamRef()', () => {
		const wrapper = shallow(
			<UpstreamsContainer { ...props } />
		);
		const instance = wrapper.instance();

		stub(instance.intersectionObserver, 'observe').callsFake(() => {});

		instance.upstreamRef(false);

		expect(instance.intersectionObserver.observe.notCalled, 'not last').to.be.true;

		instance.upstreamRef(true);

		expect(instance.intersectionObserver.observe.notCalled, 'no ref provided').to.be.true;

		instance.upstreamRef(true, { base: 'base_test' });

		expect(
			instance.intersectionObserver.observe.calledOnce,
			'called'
		).to.be.true;
		expect(
			instance.intersectionObserver.observe.args[0][0],
			'argument'
		).to.be.equal('base_test');

		instance.intersectionObserver.observe.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const upstreams = new Map([
			['test_1', {
				hasFailedPeer: false
			}], ['test_2', {
				hasFailedPeer: true
			}]
		]);

		upstreams.__STATS = {
			total: 'total_num',
			servers: {
				all: 'all_num',
				failed: 'failed_num'
			},
			failures: 'failures_num'
		};

		function TestComponent(){
			return <div />;
		};
		const wrapper = mount(
			<UpstreamsContainer
				title="test_title"
				upstreams={ upstreams }
				component={ TestComponent }
				writePermission="writePermission_test"
				upstreamsApi="upstreamsApi_test"
				isStream={ true }
			/>
		);
		const instance = wrapper.instance();

		stub(instance.upstreamRef, 'bind').callsFake(() => {});
		stub(instance, 'scrollTo').callsFake(() => 'scrollTo_result');

		const arraySliceSpy = spy(Array.prototype, 'slice');

		instance.render();

		let root = wrapper.childAt(0);

		expect(root.hasClass(styles['upstreams-container']), 'wrapper className').to.be.true;
		expect(root.children(), 'wrapper children length').to.have.lengthOf(5);
		expect(root.childAt(0).prop('className'), 'toggle-failed, className').to.be.equal(styles['toggle-failed']);
		expect(
			root.childAt(0).childAt(1).prop('className'),
			'[showOnlyFailed = false] toggle-failed child 1, className'
		).to.be.equal(styles['toggler']);
		expect(
			root.childAt(0).childAt(1).prop('onClick').name,
			'toggle-failed child 1, onClick'
		).to.be.equal('bound toggleFailed');
		expect(
			root.childAt(0).childAt(1).childAt(0).prop('className'),
			'toggle-failed child 2, className'
		).to.be.equal(styles['toggler-point']);
		expect(root.childAt(1).name(), 'title, html tag').to.be.equal('h1');
		expect(root.childAt(1).text(), 'title, text').to.be.equal('test_title');
		expect(
			root.childAt(2).prop('className'),
			'[showUpstreamsList = false] toggle upstreams list, className'
		).to.be.equal(styles['list-toggler']);
		expect(
			root.childAt(2).prop('onClick').name,
			'toggle upstreams list, onClick'
		).to.be.equal('bound toggleUpstreamsList');
		expect(
			root.childAt(2).text(),
			'toggle upstreams list, text'
		).to.be.equal('Show upstreams list');
		expect(root.childAt(3).name(), 'upstream 1, component').to.be.equal('TestComponent');
		expect(
			root.childAt(3).prop('upstream'),
			'upstream 1, upstream'
		).to.be.deep.equal(upstreams.get('test_1'));
		expect(root.childAt(3).prop('name'), 'upstream 1, name').to.be.equal('test_1');
		expect(root.childAt(3).prop('showOnlyFailed'), 'upstream 1, showOnlyFailed').to.be.false;
		expect(
			root.childAt(3).prop('writePermission'),
			'upstream 1, writePermission'
		).to.be.equal('writePermission_test');
		expect(
			root.childAt(3).prop('upstreamsApi'),
			'upstream 1, upstreamsApi'
		).to.be.equal('upstreamsApi_test');
		expect(root.childAt(3).prop('isStream'), 'upstream 1, isStream').to.be.true;

		expect(root.childAt(4).name(), 'upstream 2, component').to.be.equal('TestComponent');
		expect(
			root.childAt(4).prop('upstream'),
			'upstream 2, upstream'
		).to.be.deep.equal(upstreams.get('test_2'));
		expect(root.childAt(4).prop('name'), 'upstream 2, name').to.be.equal('test_2');
		expect(root.childAt(4).prop('showOnlyFailed'), 'upstream 2, showOnlyFailed').to.be.false;
		expect(
			root.childAt(4).prop('writePermission'),
			'upstream 2, writePermission'
		).to.be.equal('writePermission_test');
		expect(
			root.childAt(4).prop('upstreamsApi'),
			'upstream 2, upstreamsApi'
		).to.be.equal('upstreamsApi_test');
		expect(root.childAt(4).prop('isStream'), 'upstream 2, isStream').to.be.true;

		expect(instance.upstreamRef.bind.calledTwice, 'this,upstreamRef.bind called twice').to.be.true;
		expect(
			instance.upstreamRef.bind.args[0][0],
			'this,upstreamRef.bind call 1, arg 1'
		).to.be.deep.equal(instance);
		expect(instance.upstreamRef.bind.args[0][1], 'this,upstreamRef.bind call 1, arg 2').to.be.false;
		expect(
			instance.upstreamRef.bind.args[1][0],
			'this,upstreamRef.bind call 2, arg 1'
		).to.be.deep.equal(instance);
		expect(instance.upstreamRef.bind.args[1][1], 'this,upstreamRef.bind call 2, arg 2').to.be.true;

		expect(arraySliceSpy.calledOnce, '[howManyToShow is finite] Array slice called once').to.be.true;
		expect(
			arraySliceSpy.getCall(0).thisValue,
			'Array slice called on upstreams'
		).to.be.deep.equal(Array.from(upstreams));
		expect(arraySliceSpy.calledWith(0, 70), 'Array slice call arguments').to.be.true;

		upstreams.set('test_2', {
			hasFailedPeer: false
		});
		wrapper.setProps({ upstreams });
		arraySliceSpy.resetHistory();
		wrapper.setState({
			showOnlyFailed: true,
			showUpstreamsList: true,
			howManyToShow: Infinity
		});
		wrapper.update();
		root = wrapper.childAt(0);

		expect(root.children(), 'wrapper children length').to.have.lengthOf(5);
		expect(
			root.childAt(0).childAt(1).prop('className'),
			'[showOnlyFailed = true] toggle-failed child 1, className'
		).to.be.equal(styles['toggler-active']);
		expect(
			root.childAt(2).prop('className'),
			'[showUpstreamsList = true] toggle upstreams list, className'
		).to.be.equal(styles['list-toggler-opened']);
		expect(
			root.childAt(2).text(),
			'toggle upstreams list, text'
		).to.be.equal('Hide upstreams list');
		expect(
			root.childAt(3).prop('className'),
			'upstreams catalog, className'
		).to.be.equal(styles['upstreams-catalog']);
		expect(
			root.childAt(3).childAt(0).prop('className'),
			'upstreams catalog, summary, className'
		).to.be.equal(styles['upstreams-summary']);
		expect(
			root.childAt(3).childAt(0).find(`.${styles['red-text']}`),
			'upstreams catalog, summary, with problems, className'
		).to.have.lengthOf(1);
		expect(
			root.childAt(3).childAt(0).text(),
			'upstreams catalog, summary text'
		).to.be.equal('Total: total_num upstreams (all_num servers)With problems: failures_num upstreams (failed_num servers)');
		expect(
			root.childAt(3).childAt(1).prop('className'),
			'upstreams catalog, navlinks, className'
		).to.be.equal(styles['upstreams-navlinks']);
		expect(
			root.childAt(3).childAt(1).children(),
			'[no failed upstreams] upstreams catalog, navlinks, children length'
		).to.have.lengthOf(0);
		expect(
			root.childAt(4).prop('className'),
			'[no upstreams to display] upstreams, className'
		).to.be.equal(styles['msg']);

		expect(arraySliceSpy.notCalled, '[howManyToShow = Infinity] Array slice not called').to.be.true;

		upstreams.set('test_2', {
			hasFailedPeer: true
		});
		wrapper.setProps({ upstreams });
		root = wrapper.childAt(0);

		expect(
			root.childAt(3).childAt(1).children(),
			'[with failed upstreams] upstreams catalog, navlinks, children length'
		).to.have.lengthOf(1);
		expect(
			root.childAt(3).childAt(1).childAt(0).prop('className'),
			'upstreams catalog, navlink, className'
		).to.be.equal(styles['upstream-link-failed']);
		expect(
			root.childAt(3).childAt(1).childAt(0).prop('onClick'),
			'upstreams catalog, navlink, onClick'
		).to.be.a('function');
		expect(
			root.childAt(3).childAt(1).childAt(0).prop('onClick')(),
			'upstreams catalog, navlink, onClick returns'
		).to.be.equal('scrollTo_result');
		expect(
			instance.scrollTo.calledOnce,
			'this.scrollTo called once from navlink onClick prop'
		).to.be.true;
		expect(
			instance.scrollTo.calledWith('test_2', 1),
			'this.scrollTo call from navlink onClick prop, arguments'
		).to.be.true;
		expect(
			root.childAt(3).childAt(1).childAt(0).childAt(0).prop('className'),
			'upstreams catalog, navlink, name className'
		).to.be.equal(styles['dashed']);
		expect(
			root.childAt(3).childAt(1).childAt(0).text(),
			'upstreams catalog, navlink, text'
		).to.be.equal('test_2');

		wrapper.setState({
			showOnlyFailed: false
		});
		wrapper.update();
		root = wrapper.childAt(0);

		expect(
			root.childAt(3).childAt(1).children(),
			'[showOnlyFailed = false] upstreams catalog, navlinks, children length'
		).to.have.lengthOf(2);
		expect(
			root.childAt(3).childAt(1).childAt(0).prop('className'),
			'[showOnlyFailed = false] upstreams catalog, navlink 1, className'
		).to.be.equal(styles['upstream-link']);
		expect(
			root.childAt(3).childAt(1).childAt(0).text(),
			'upstreams catalog, navlink, text'
		).to.be.equal('test_1');

		instance.upstreamRef.bind.restore();
		instance.scrollTo.restore();
		arraySliceSpy.restore();
		wrapper.unmount();
	});
});
