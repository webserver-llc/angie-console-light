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
import { shallow, mount } from 'enzyme';
import UpstreamsContainer, { UPSTREAM_GROUP_LENGTH } from '../upstreamscontainer.jsx';
import styles from '../style.css';

beforeEach(() => {
	jest.restoreAllMocks();
});

describe('<UpstreamsContainer />', () => {
	const props = {
		upstreams: new Map(),
		component(){}
	};

	it('constructor()', () => {
		const toggleFailedSpy = jest.spyOn(UpstreamsContainer.prototype.toggleFailed, 'bind').mockClear();
		const toggleUpstreamsListSpy = jest.spyOn(UpstreamsContainer.prototype.toggleUpstreamsList, 'bind').mockClear();
		const handleLastItemShowingSpy = jest.spyOn(UpstreamsContainer.prototype.handleLastItemShowing, 'bind').mockClear();
		let initIntObsResult = false;
		const initIntOsververStub = jest.spyOn(UpstreamsContainer.prototype, 'initIntersectionObserver').mockClear()
			.mockImplementation(() => initIntObsResult);
		let wrapper = shallow(
			<UpstreamsContainer {...props} />
		);

		// this.state
		expect(wrapper.state()).toEqual({
			showOnlyFailed: false,
			showUpstreamsList: false,
			editor: false,
			howManyToShow: Infinity
		});
		// this.toggleFailed.bind called
		expect(toggleFailedSpy).toHaveBeenCalled();
		// this.toggleFailed.bind arg
		expect(toggleFailedSpy.mock.calls[0][0] instanceof UpstreamsContainer).toBe(true);
		// this.toggleUpstreamsList.bind called
		expect(toggleUpstreamsListSpy).toHaveBeenCalled();
		// this.toggleUpstreamsList.bind arg
		expect(toggleUpstreamsListSpy.mock.calls[0][0] instanceof UpstreamsContainer).toBe(true);
		// this.handleLastItemShowing.bind called
		expect(handleLastItemShowingSpy).toHaveBeenCalled();
		// this.handleLastItemShowing.bind arg
		expect(handleLastItemShowingSpy.mock.calls[0][0] instanceof UpstreamsContainer).toBe(true);
		// this.initIntersectionObserver called
		expect(initIntOsververStub).toHaveBeenCalled();

		initIntObsResult = true;
		wrapper = shallow(
			<UpstreamsContainer {...props} />
		);

		// [this.initIntersectionObserver() = true] this.state.howManyToShow
		expect(wrapper.state('howManyToShow')).toBe(UPSTREAM_GROUP_LENGTH);

		initIntOsververStub.mockRestore();
		handleLastItemShowingSpy.mockRestore();
		toggleUpstreamsListSpy.mockRestore();
		toggleFailedSpy.mockRestore();
	});

	it('toggleFailed()', () => {
		const wrapper = shallow(
			<UpstreamsContainer {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'setState').mockClear().mockImplementation(() => {});

		instance.toggleFailed();

		// this.setState called
		expect(instance.setState).toHaveBeenCalled();
		// this.setState arg
		expect(instance.setState.mock.calls[0][0]).toEqual({
			showOnlyFailed: true
		});

		instance.setState.mockRestore();
		wrapper.unmount();
	});

	it('toggleUpstreamsList()', () => {
		const wrapper = shallow(
			<UpstreamsContainer {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance, 'setState').mockClear().mockImplementation(() => {});

		instance.toggleUpstreamsList();

		// this.setState called
		expect(instance.setState).toHaveBeenCalled();
		// this.setState arg
		expect(instance.setState.mock.calls[0][0]).toEqual({
			showUpstreamsList: true
		});

		instance.setState.mockRestore();
		wrapper.unmount();
	});

	it('initIntersectionObserver()', () => {
		const _IntersectionObserver = window.IntersectionObserver;

		delete window.IntersectionObserver;

		const wrapper = shallow(
			<UpstreamsContainer {...props} />
		);
		const instance = wrapper.instance();

		// IntersectionObserver not supported
		expect(instance.initIntersectionObserver()).toBe(false);
		expect(instance.intersectionObserver).toBeUndefined();

		window.IntersectionObserver = _IntersectionObserver;

		const intObserverSpy = jest.spyOn(window, 'IntersectionObserver').mockClear().mockImplementation(() => {});

		// IntersectionObserver supported
		expect(instance.initIntersectionObserver()).toBe(true);
		// this.intersectionObserver
		// IntersectionObserver created
		expect(intObserverSpy).toHaveBeenCalled();
		// IntersectionObserver arg 1
		expect(intObserverSpy.mock.calls[0][0].name).toBe('bound handleLastItemShowing');
		// IntersectionObserver arg 2
		expect(intObserverSpy.mock.calls[0][1]).toEqual({
			root: null,
			threshold: 0.3
		});

		intObserverSpy.mockRestore();
		wrapper.unmount();
	});

	it('handleLastItemShowing()', () => {
		function Component() {
			return (
				<div>Test</div>
			);
		}
		const wrapper = mount(
			<UpstreamsContainer
				{...props}
				component={Component}
				upstreams={new Map([
					['test_1', {}],
					['test_2', {}]
				])}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		jest.spyOn(instance.intersectionObserver, 'unobserve').mockClear().mockImplementation(() => {});

		instance.handleLastItemShowing([{}]);

		// [no isIntersecting] this.intersectionObserver.unobserve not called
		expect(instance.intersectionObserver.unobserve).not.toHaveBeenCalled();
		// [no isIntersecting] this.setState not called
		expect(setStateSpy).not.toHaveBeenCalled();

		wrapper.setState({ howManyToShow: Infinity });
		wrapper.update();
		setStateSpy.mockClear();
		instance.handleLastItemShowing([{ isIntersecting: true }]);

		// [state.howManyToShow = Infinity] this.intersectionObserver.unobserve not called
		expect(instance.intersectionObserver.unobserve).not.toHaveBeenCalled();
		// [state.howManyToShow = Infinity] this.setState not called
		expect(setStateSpy).not.toHaveBeenCalled();

		wrapper.setState({ howManyToShow: 70 });
		wrapper.update();
		setStateSpy.mockClear();
		instance.handleLastItemShowing([{ isIntersecting: true }]);

		// [upstreams.size < state.howManyToShow] this.intersectionObserver.unobserve not called
		expect(instance.intersectionObserver.unobserve).not.toHaveBeenCalled();
		// [upstreams.size < state.howManyToShow] this.setState not called
		expect(setStateSpy).not.toHaveBeenCalled();

		wrapper.setState({ howManyToShow: 1 });
		wrapper.update();
		setStateSpy.mockClear();
		instance.handleLastItemShowing([{
			isIntersecting: true,
			target: 'test_target'
		}]);

		expect(instance.intersectionObserver.unobserve).toHaveBeenCalled();
		// this.intersectionObserver.unobserve call arg
		expect(instance.intersectionObserver.unobserve.mock.calls[0][0]).toBe('test_target');
		// this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call arg
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			howManyToShow: 71
		});

		setStateSpy.mockRestore();
		instance.intersectionObserver.unobserve.mockRestore();
		wrapper.unmount();
	});

	it('scrollTo()', () => {
		const wrapper = shallow(
			<UpstreamsContainer {...props} />
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();
		const scrollIntoViewSpy = jest.fn();

		jest.spyOn(document, 'getElementById').mockClear().mockImplementation(() => ({
			scrollIntoView: scrollIntoViewSpy
		}));

		instance.scrollTo('test_upstream', 3);

		// this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call arg 1
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			howManyToShow: 73
		});
		expect(setStateSpy.mock.calls[0][1]).toBeInstanceOf(Function);

		setStateSpy.mock.calls[0][1]();

		// document.getElementById called
		expect(document.getElementById).toHaveBeenCalled();
		// document.getElementById call arg
		expect(document.getElementById.mock.calls[0][0]).toBe('upstream-test_upstream');
		// scrollIntoView called
		expect(scrollIntoViewSpy).toHaveBeenCalled();

		setStateSpy.mockRestore();
		document.getElementById.mockRestore();
		wrapper.unmount();
	});

	it('upstreamRef()', () => {
		const wrapper = shallow(
			<UpstreamsContainer {...props} />
		);
		const instance = wrapper.instance();

		jest.spyOn(instance.intersectionObserver, 'observe').mockClear().mockImplementation(() => {});

		instance.upstreamRef(false);

		// not last
		expect(instance.intersectionObserver.observe).not.toHaveBeenCalled();

		instance.upstreamRef(true);

		// no ref provided
		expect(instance.intersectionObserver.observe).not.toHaveBeenCalled();

		instance.upstreamRef(true, { base: 'base_test' });

		// called
		expect(instance.intersectionObserver.observe).toHaveBeenCalled();
		// argument
		expect(instance.intersectionObserver.observe.mock.calls[0][0]).toBe('base_test');

		instance.intersectionObserver.observe.mockRestore();
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
		}
		const wrapper = mount(
			<UpstreamsContainer
				title="test_title"
				upstreams={upstreams}
				component={TestComponent}
				writePermission="writePermission_test"
				upstreamsApi="upstreamsApi_test"
				isStream
			/>
		);
		const instance = wrapper.instance();

		jest.spyOn(instance.upstreamRef, 'bind').mockClear().mockImplementation(() => {});
		jest.spyOn(instance, 'scrollTo').mockClear().mockImplementation(() => 'scrollTo_result');

		const arraySliceSpy = jest.spyOn(Array.prototype, 'slice').mockClear();

		instance.render();

		let root = wrapper.childAt(0);

		// wrapper className
		expect(root.hasClass(styles['upstreams-container'])).toBe(true);
		// wrapper children length
		expect(root.children()).toHaveLength(5);
		// toggle-failed, className
		expect(root.childAt(0).prop('className')).toBe(styles['toggle-failed']);
		// [showOnlyFailed = false] toggle-failed child 1, className
		expect(root.childAt(0).childAt(1).prop('className')).toBe(styles.toggler);
		// toggle-failed child 1, onClick
		expect(root.childAt(0).childAt(1).prop('onClick').name).toBe('bound toggleFailed');
		// toggle-failed child 2, className
		expect(root.childAt(0).childAt(1).childAt(0).prop('className')).toBe(styles['toggler-point']);
		// title, html tag
		expect(root.childAt(1).name()).toBe('h1');
		// title, text
		expect(root.childAt(1).text()).toBe('test_title');
		// [showUpstreamsList = false] toggle upstreams list, className
		expect(root.childAt(2).prop('className')).toBe(styles['list-toggler']);
		// toggle upstreams list, onClick
		expect(root.childAt(2).prop('onClick').name).toBe('bound toggleUpstreamsList');
		// toggle upstreams list, text
		expect(root.childAt(2).text()).toBe('Show upstreams list');
		// upstream 1, component
		expect(root.childAt(3).name()).toBe('TestComponent');
		// upstream 1, upstream
		expect(root.childAt(3).prop('upstream')).toEqual(upstreams.get('test_1'));
		// upstream 1, name
		expect(root.childAt(3).prop('name')).toBe('test_1');
		// upstream 1, showOnlyFailed
		expect(root.childAt(3).prop('showOnlyFailed')).toBe(false);
		// upstream 1, writePermission
		expect(root.childAt(3).prop('writePermission')).toBe('writePermission_test');
		// upstream 1, upstreamsApi
		expect(root.childAt(3).prop('upstreamsApi')).toBe('upstreamsApi_test');
		// upstream 1, isStream
		expect(root.childAt(3).prop('isStream')).toBe(true);

		// upstream 2, component
		expect(root.childAt(4).name()).toBe('TestComponent');
		// upstream 2, upstream
		expect(root.childAt(4).prop('upstream')).toEqual(upstreams.get('test_2'));
		// upstream 2, name
		expect(root.childAt(4).prop('name')).toBe('test_2');
		// upstream 2, showOnlyFailed
		expect(root.childAt(4).prop('showOnlyFailed')).toBe(false);
		// upstream 2, writePermission
		expect(root.childAt(4).prop('writePermission')).toBe('writePermission_test');
		// upstream 2, upstreamsApi
		expect(root.childAt(4).prop('upstreamsApi')).toBe('upstreamsApi_test');
		// upstream 2, isStream
		expect(root.childAt(4).prop('isStream')).toBe(true);

		// this,upstreamRef.bind called twice
		expect(instance.upstreamRef.bind).toHaveBeenCalled();
		// this,upstreamRef.bind call 1, arg 1
		expect(instance.upstreamRef.bind.mock.calls[0][0]).toEqual(instance);
		// this,upstreamRef.bind call 1, arg 2
		expect(instance.upstreamRef.bind.mock.calls[0][1]).toBe(false);
		// this,upstreamRef.bind call 2, arg 1
		expect(instance.upstreamRef.bind.mock.calls[1][0]).toEqual(instance);
		// this,upstreamRef.bind call 2, arg 2
		expect(instance.upstreamRef.bind.mock.calls[1][1]).toBe(true);

		// [howManyToShow is finite] Array slice called once
		expect(arraySliceSpy).toHaveBeenCalled();
		// Array slice call arguments
		expect(arraySliceSpy).toHaveBeenCalledWith(0, 70);

		upstreams.set('test_2', {
			hasFailedPeer: false
		});
		wrapper.setProps({ upstreams });
		arraySliceSpy.mockReset();
		wrapper.setState({
			showOnlyFailed: true,
			showUpstreamsList: true,
			howManyToShow: Infinity
		});
		wrapper.update();
		root = wrapper.childAt(0);

		// wrapper children length
		expect(root.children()).toHaveLength(5);
		// [showOnlyFailed = true] toggle-failed child 1, className
		expect(root.childAt(0).childAt(1).prop('className')).toBe(styles['toggler-active']);
		// [showUpstreamsList = true] toggle upstreams list, className
		expect(root.childAt(2).prop('className')).toBe(styles['list-toggler-opened']);
		// toggle upstreams list, text
		expect(root.childAt(2).text()).toBe('Hide upstreams list');
		// upstreams catalog, className
		expect(root.childAt(3).prop('className')).toBe(styles['upstreams-catalog']);
		// upstreams catalog, summary, className
		expect(root.childAt(3).childAt(0).prop('className')).toBe(styles['upstreams-summary']);
		// upstreams catalog, summary, with problems, className
		expect(root.childAt(3).childAt(0).find(`.${styles['red-text']}`)).toHaveLength(1);
		// upstreams catalog, summary text
		expect(root.childAt(3).childAt(0).text()).toBe(
			'Total: total_num upstreams (all_num servers)With problems: failures_num upstreams (failed_num servers)'
		);
		// upstreams catalog, navlinks, className
		expect(root.childAt(3).childAt(1).prop('className')).toBe(styles['upstreams-navlinks']);
		// [no failed upstreams] upstreams catalog, navlinks, children length
		expect(root.childAt(3).childAt(1).children()).toHaveLength(0);
		// [no upstreams to display] upstreams, className
		expect(root.childAt(4).prop('className')).toBe(styles.msg);

		// [howManyToShow = Infinity] Array slice not called
		expect(arraySliceSpy).not.toHaveBeenCalled();

		upstreams.set('test_2', {
			hasFailedPeer: true
		});
		wrapper.setProps({ upstreams });
		root = wrapper.childAt(0);

		// [with failed upstreams] upstreams catalog, navlinks, children length
		expect(root.childAt(3).childAt(1).children()).toHaveLength(1);
		// upstreams catalog, navlink, className
		expect(root.childAt(3).childAt(1).childAt(0).prop('className')).toBe(styles['upstream-link-failed']);
		expect(root.childAt(3).childAt(1).childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// upstreams catalog, navlink, onClick returns
		expect(root.childAt(3).childAt(1).childAt(0).prop('onClick')()).toBe('scrollTo_result');
		// this.scrollTo called once from navlink onClick prop
		expect(instance.scrollTo).toHaveBeenCalled();
		// this.scrollTo call from navlink onClick prop, arguments
		expect(instance.scrollTo).toHaveBeenCalledWith('test_2', 1);
		// upstreams catalog, navlink, name className
		expect(root.childAt(3).childAt(1).childAt(0).childAt(0)
			.prop('className')).toBe(styles.dashed);
		// upstreams catalog, navlink, text
		expect(root.childAt(3).childAt(1).childAt(0).text()).toBe('test_2');

		wrapper.setState({
			showOnlyFailed: false
		});
		wrapper.update();
		root = wrapper.childAt(0);

		// [showOnlyFailed = false] upstreams catalog, navlinks, children length
		expect(root.childAt(3).childAt(1).children()).toHaveLength(2);
		// [showOnlyFailed = false] upstreams catalog, navlink 1, className
		expect(root.childAt(3).childAt(1).childAt(0).prop('className')).toBe(styles['upstream-link']);
		// upstreams catalog, navlink, text
		expect(root.childAt(3).childAt(1).childAt(0).text()).toBe('test_1');

		instance.upstreamRef.bind.mockRestore();
		instance.scrollTo.mockRestore();
		arraySliceSpy.mockRestore();
		wrapper.unmount();
	});
});
