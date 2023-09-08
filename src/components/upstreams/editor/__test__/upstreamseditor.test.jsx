/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import utils from '../formData.js';
import UpstreamsEditor from '../upstreamseditor.jsx';
import styles from '../style.css';

beforeEach(() => {
	jest.restoreAllMocks();
});

describe('<UpstreamsEditor />', () => {
	it('normalizeInputData()', () => {
		const data = {
			test_prop_1: '123',
			fail_timeout: '5s',
			slow_start: '900s'
		};
		const parsedData = UpstreamsEditor.normalizeInputData(data);

		// test_prop_1
		expect(parsedData.test_prop_1).toBe(data.test_prop_1);
		// fail_timeout
		expect(parsedData.fail_timeout).toBe(5);
		// slow_start
		expect(parsedData.slow_start).toBe(900);
	});

	it('normalizeOutputData()', () => {
		const data = {
			test_prop_1: '123',
			server: 'test_server',
			id: 1,
			host: 'test_host'
		};
		let parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server_1' });

		// test_prop_1
		expect(parsedData.test_prop_1).toBe(data.test_prop_1);
		// [data.server != initialData.server] server
		expect('server' in parsedData).toBe(true);
		expect(parsedData.id).toBeUndefined();
		// [no parent] host
		expect('host' in parsedData).toBe(true);

		parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server' });

		expect(parsedData.server).toBeUndefined();

		data.parent = 'parent_test';
		parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server_1' });

		expect(parsedData.parent).toBeUndefined();
		expect(parsedData.host).toBeUndefined();
		expect(parsedData.server).toBeUndefined();
	});

	const props = {
		peers: new Map([
			['test_4', {
				id: 4,
				server: 'test_server_4'
			}]
		]),
		upstream: { name: 'upstream_test' },
		upstreamsApi: { getPeer(){
			return Promise.resolve({});
		} }
	};

	it('constructor()', () => {
		const validateServerNameSpy = jest.spyOn(UpstreamsEditor.prototype.validateServerName, 'bind').mockClear();
		const handleFormChangeSpy = jest.spyOn(UpstreamsEditor.prototype.handleFormChange, 'bind').mockClear();
		const handleRadioChangeSpy = jest.spyOn(UpstreamsEditor.prototype.handleRadioChange, 'bind').mockClear();
		const validateSpy = jest.spyOn(UpstreamsEditor.prototype.validate, 'bind').mockClear();
		const saveSpy = jest.spyOn(UpstreamsEditor.prototype.save, 'bind').mockClear();
		const closeSpy = jest.spyOn(UpstreamsEditor.prototype.close, 'bind').mockClear();
		const removeSpy = jest.spyOn(UpstreamsEditor.prototype.remove, 'bind').mockClear();
		const closeErrorsSpy = jest.spyOn(UpstreamsEditor.prototype.closeErrors, 'bind').mockClear();
		jest.spyOn(utils, 'formData').mockClear().mockImplementation((data = {}) => data);

		let wrapper = shallow(
			<UpstreamsEditor {...({ ...props, peers: null })} />
		);

		// [no peers] this.state
		expect(wrapper.state()).toEqual({
			success: false,
			loading: false,
			errorMessages: null,
			shouldClearPeers: false,
			data: {},
			initialData: {}
		});

		// this.validateServerName.bind called once
		expect(validateServerNameSpy).toHaveBeenCalled();
		// this.validateServerName.bind arg
		expect(validateServerNameSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.handleFormChange.bind called once
		expect(handleFormChangeSpy).toHaveBeenCalled();
		// this.handleFormChange.bind arg
		expect(handleFormChangeSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.handleRadioChange.bind called once
		expect(handleRadioChangeSpy).toHaveBeenCalled();
		// this.handleRadioChange.bind arg
		expect(handleRadioChangeSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.validate.bind called once
		expect(validateSpy).toHaveBeenCalled();
		// this.validate.bind arg
		expect(validateSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.save.bind called once
		expect(saveSpy).toHaveBeenCalled();
		// this.save.bind arg
		expect(saveSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.close.bind called once
		expect(closeSpy).toHaveBeenCalled();
		// this.close.bind arg
		expect(closeSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.remove.bind called once
		expect(removeSpy).toHaveBeenCalled();
		// this.remove.bind arg
		expect(removeSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);
		// this.closeErrors.bind called once
		expect(closeErrorsSpy).toHaveBeenCalled();
		// this.closeErrors.bind arg
		expect(closeErrorsSpy.mock.calls[0][0] instanceof UpstreamsEditor).toBe(true);

		wrapper = shallow(
			<UpstreamsEditor {...({ ...props, peers: new Map() })} />,
		);

		// [no peers] this.state
		expect(wrapper.state()).toEqual({
			success: false,
			loading: false,
			errorMessages: null,
			shouldClearPeers: false,
		});

		wrapper = shallow(
			<UpstreamsEditor {...({ ...props,
				peers: new Map([
					['test_1', {}],
					['test_2', {}],
					['test_3', {}]
				]) })}
			/>
		);

		// [peers.size > 1] this.state.data
		expect(wrapper.state('data')).toEqual({});
		// [peers.size > 1] this.state.initialData
		expect(wrapper.state('initialData')).toEqual({});

		const thenSpy = jest.fn();
		const getPeerSpy = jest.fn(() => ({
			then: thenSpy
		}));

		wrapper = shallow(
			<UpstreamsEditor {...({ ...props,
				upstreamsApi: {
					getPeer: getPeerSpy
				} })}
			/>
		);

		// [peers.size = 1] this.state.loading
		expect(wrapper.state('loading')).toBe(true);
		expect(wrapper.state('data')).toBeUndefined();
		expect(wrapper.state('initialData')).toBeUndefined();
		// upstreamsApi.getPeer called once
		expect(getPeerSpy).toHaveBeenCalled();
		// upstreamsApi.getPeer call args
		expect(getPeerSpy).toHaveBeenLastCalledWith('upstream_test', {
			id: 4,
			server: 'test_server_4'
		});
		// upstreamsApi.getPeer().then called once
		expect(thenSpy).toHaveBeenCalled();
		expect(thenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		const setStateSpy = jest.spyOn(wrapper.instance(), 'setState').mockClear();
		const peerData = {
			should_be_normilized: true,
			and_passed_to: 'state'
		};

		jest.spyOn(UpstreamsEditor, 'normalizeInputData').mockClear().mockImplementation(data => ({
			...data,
			normalized_by_normalizeInputData: true
		}));
		thenSpy.mock.calls[0][0](peerData);

		// UpstreamsEditor.normalizeInputData called once
		expect(UpstreamsEditor.normalizeInputData).toHaveBeenCalled();
		// UpstreamsEditor.normalizeInputData call args
		expect(UpstreamsEditor.normalizeInputData.mock.calls[0][0]).toEqual(peerData);
		// this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			data: {
				should_be_normilized: true,
				and_passed_to: 'state',
				normalized_by_normalizeInputData: true
			},
			initialData: {
				should_be_normilized: true,
				and_passed_to: 'state',
				normalized_by_normalizeInputData: true
			},
			loading: false
		});

		UpstreamsEditor.normalizeInputData.mockRestore();

		validateServerNameSpy.mockRestore();
		handleFormChangeSpy.mockRestore();
		handleRadioChangeSpy.mockRestore();
		validateSpy.mockRestore();
		saveSpy.mockRestore();
		closeSpy.mockRestore();
		removeSpy.mockRestore();
		closeErrorsSpy.mockRestore();
		utils.formData.mockRestore();
	});

	it('handleFormChange()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();

		wrapper.setState({ data: {} });

		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.handleFormChange({ target: {
			name: 'form_field_1',
			type: 'checkbox',
			checked: false
		} });

		// [checkbox changed] this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// [checkbox changed] this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			data: {
				form_field_1: false
			}
		});

		setStateSpy.mockReset();
		instance.handleFormChange({ target: {
			name: 'form_field_2',
			type: 'text',
			value: 'test value 2'
		} });

		// [text input changed] this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// [text input changed] this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			data: {
				form_field_1: false,
				form_field_2: 'test value 2'
			}
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('handleRadioChange()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();

		wrapper.setState({ data: {
			down: true
		} });

		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.handleRadioChange({ target: {
			id: 'drain'
		} });

		// [drain change] this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// [drain change] this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			data: { drain: true }
		});

		setStateSpy.mockReset();
		instance.handleRadioChange({ target: {
			id: 'test_id',
			value: 'true'
		} });

		// this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			data: { down: true }
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('save()', () => {
		const data = {
			server: 'test_server',
			drain: true,
			address: 'localhost:8080'
		};
		const initialData = {
			server: 'test_server_before'
		};
		const updatePeerSpy = jest.fn((_, { server }) => `updatePeer_result_${ server }`);
		const wrapper = shallow(<UpstreamsEditor
			{...props}
			upstreamsApi={{
				getPeer(){
					return Promise.resolve({});
				},
				updatePeer: updatePeerSpy
			}}
		/>);
		const instance = wrapper.instance();

		wrapper.setState({ data, initialData });

		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();
		const catchSpy = jest.fn();
		const nextThenSpy = jest.fn(() => ({
			catch: catchSpy
		}));
		const thenSpy = jest.fn(() => ({
			then: nextThenSpy
		}));

		jest.spyOn(instance, 'closeErrors').mockClear().mockImplementation(() => {});
		jest.spyOn(instance, 'validate').mockClear().mockImplementation(() => ({
			then: thenSpy
		}));
		jest.spyOn(UpstreamsEditor, 'normalizeOutputData').mockClear().mockImplementation(data => ({
			...data,
			normalized_by_normalizeOutputData: true
		}));

		instance.save();

		// this.closeErrors called once
		expect(instance.closeErrors).toHaveBeenCalled();
		// this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			loading: true
		});
		// this.validate called once
		expect(instance.validate).toHaveBeenCalled();
		// this.validate call args
		expect(instance.validate.mock.calls[0][0]).toEqual(data);
		// this.validate, first "then" called
		expect(thenSpy).toHaveBeenCalled();
		expect(thenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		const promiseAllThenSpy = jest.fn(() => 'promise_all_result');

		jest.spyOn(Promise, 'all').mockClear().mockImplementation(() => ({
			then: promiseAllThenSpy
		}));

		// this.validate, first "then" callback result
		expect(thenSpy.mock.calls[0][0]()).toBe('promise_all_result');
		// this.validate, first "then" cb, Promise.all called
		expect(Promise.all).toHaveBeenCalled();
		// this.validate, first "then" cb, Promise.all call args
		expect(Promise.all.mock.calls[0][0]).toEqual([ 'updatePeer_result_test_server_4' ]);
		// upstreamsApi.updatePeer called once
		expect(updatePeerSpy).toHaveBeenCalled();
		// upstreamsApi.updatePeer call args
		expect(updatePeerSpy).toHaveBeenLastCalledWith('upstream_test', {
			id: 4,
			server: 'test_server_4'
		}, {
			...data,
			normalized_by_normalizeOutputData: true
		});
		// UpstreamsEditor.normalizeOutputData called once
		expect(UpstreamsEditor.normalizeOutputData).toHaveBeenCalled();
		// UpstreamsEditor.normalizeOutputData call args
		expect(UpstreamsEditor.normalizeOutputData).toHaveBeenLastCalledWith(
			data, initialData
		);
		// Promise.all, first "then" called
		expect(promiseAllThenSpy).toHaveBeenCalled();
		expect(promiseAllThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		setStateSpy.mockReset();
		promiseAllThenSpy.mock.calls[0][0]();

		// Promise.all, first "then", this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// Promise.all, first "then", this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			success: true,
			successMessage: 'Changes saved'
		});
		// this.validate, second "then" called
		expect(nextThenSpy).toHaveBeenCalled();
		expect(nextThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		setStateSpy.mockClear();
		nextThenSpy.mock.calls[0][0]();

		// this.validate, second "then", this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.validate, second "then", this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			loading: false
		});
		// this.validate, catch called
		expect(catchSpy).toHaveBeenCalled();
		expect(catchSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		jest.spyOn(instance, 'showErrors').mockClear().mockImplementation(() => {});
		catchSpy.mock.calls[0][0]({ error: 'test error' });

		// this.validate, catch call, this.showErrors called
		expect(instance.showErrors).toHaveBeenCalled();
		// this.validate, catch call, this.showErrors call args
		expect(instance.showErrors.mock.calls[0][0]).toEqual([ 'test error' ]);

		instance.showErrors.mockClear();
		catchSpy.mock.calls[0][0](['test error', 'another test error']);

		// this.validate, catch call, this.showErrors called
		expect(instance.showErrors).toHaveBeenCalled();
		// this.validate, catch call, this.showErrors call args
		expect(instance.showErrors.mock.calls[0][0]).toEqual(['test error', 'another test error']);

		const createPeerThenSpy = jest.fn(() => 'create_peer_result');
		const createPeerSpy = jest.fn(() => ({
			then: createPeerThenSpy
		}));

		thenSpy.mockClear();
		Promise.all.mockClear();
		wrapper.setProps({
			...props,
			peers: null,
			upstreamsApi: {
				getPeer(){
					return Promise.resolve({});
				},
				createPeer: createPeerSpy
			}
		});

		instance.save();

		// [isAdd = true] this.validate, first "then" called
		expect(thenSpy).toHaveBeenCalled();
		expect(thenSpy.mock.calls[0][0]).toBeInstanceOf(Function);
		// [isAdd = true] this.validate, first "then" callback result
		expect(thenSpy.mock.calls[0][0]()).toBe('create_peer_result');
		// upstreamsApi.createPeer called
		expect(createPeerSpy).toHaveBeenCalled();
		// upstreamsApi.createPeer call 1st arg
		expect(createPeerSpy.mock.calls[0][0]).toBe('upstream_test');
		// upstreamsApi.createPeer call 2nd arg
		expect(createPeerSpy.mock.calls[0][1]).toEqual(wrapper.state('data'));
		// createPeer, 1st "then" cb called
		expect(createPeerThenSpy).toHaveBeenCalled();
		expect(createPeerThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		setStateSpy.mockReset();
		createPeerThenSpy.mock.calls[0][0]();

		// createPeer, 1st "then" cb, this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// createPeer, 1st "then" cb, this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			success: true,
			successMessage: 'Server added successfully'
		});
		// this.validate, first "then" cb, Promise.all not called
		expect(Promise.all).not.toHaveBeenCalled();

		Promise.all.mockRestore();
		instance.showErrors.mockRestore();
		setStateSpy.mockRestore();
		instance.closeErrors.mockRestore();
		instance.validate.mockRestore();
		UpstreamsEditor.normalizeOutputData.mockRestore();
		wrapper.unmount();
	});

	it('closeErrors()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.closeErrors();

		// this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			errorMessages: null
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('showErrors()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();
		const errorMessages = ['error_1', 'error_2'];

		instance.showErrors(errorMessages);

		// this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			errorMessages,
			loading: false
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('close()', () => {
		const onCloseSpy = jest.fn();
		const wrapper = shallow(
			<UpstreamsEditor
				{...props}
				onClose={onCloseSpy}
			/>);
		const instance = wrapper.instance();

		instance.close();

		// this.props.onClose called
		expect(onCloseSpy).toHaveBeenCalled();

		wrapper.unmount();
	});

	it('remove()', () => {
		const deletePeerThenSpy = jest.fn(() => 'deletePeer_result');
		const deletePeerSpy = jest.fn((_, id) => ({
			then: deletePeerThenSpy
		}));
		const wrapper = shallow(
			<UpstreamsEditor
				{...props}
				upstreamsApi={{
					getPeer(){
						return Promise.resolve({});
					},
					deletePeer: deletePeerSpy
				}}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();
		const catchSpy = jest.fn();
		const thenSpy = jest.fn(() => ({
			catch: catchSpy
		}));

		jest.spyOn(Promise, 'all').mockClear().mockImplementation(() => ({
			then: thenSpy
		}));
		jest.spyOn(instance, 'showErrors').mockClear().mockImplementation(() => 'showErrors_result');

		instance.remove();

		// Promise.all called
		expect(Promise.all).toHaveBeenCalled();
		// Promise.all call args
		expect(Promise.all.mock.calls[0][0]).toEqual([
			'deletePeer_result'
		]);
		// upstreamsApi.deletePeer called
		expect(deletePeerSpy).toHaveBeenCalled();
		// upstreamsApi.deletePeer call args
		expect(deletePeerSpy).toHaveBeenLastCalledWith('upstream_test', {
			id: 4,
			server: 'test_server_4'
		});
		// upstreamsApi.deletePeer "then" called
		expect(deletePeerThenSpy).toHaveBeenCalled();
		expect(deletePeerThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);
		// upstreamsApi.deletePeer "then" call arg result
		expect(deletePeerThenSpy.mock.calls[0][0]()).toBe('test_server_4');
		// Promise.all, "then" called
		expect(thenSpy).toHaveBeenCalled();
		expect(thenSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		thenSpy.mock.calls[0][0](['1', '2', '3']);

		// this.setState called once
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			success: true,
			shouldClearPeers: true,
			successMessage: 'Servers 1, 2, 3 successfully removed'
		});
		// Promise.all, "catch" called
		expect(catchSpy).toHaveBeenCalled();
		expect(catchSpy.mock.calls[0][0]).toBeInstanceOf(Function);

		setStateSpy.mockReset();
		// Promise.all, "catch" callback result
		expect(catchSpy.mock.calls[0][0]({ error: 'test_error' })).toBe('showErrors_result');
		// this.showErrors called once
		expect(instance.showErrors).toHaveBeenCalled();
		// this.showErrors call args
		expect(instance.showErrors.mock.calls[0][0]).toEqual([
			'test_error'
		]);

		Promise.all.mockRestore();
		instance.showErrors.mockRestore();
		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('validate()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();

		jest.spyOn(Promise, 'resolve').mockClear().mockImplementation(() => true);
		jest.spyOn(Promise, 'reject').mockClear().mockImplementation(errors => errors);

		let result = instance.validate({});

		// [empty data] result
		expect(result).toBe(true);

		result = instance.validate({ server: '127.0.0.1' });

		// [server is IP] result
		expect(result).toBe(true);

		result = instance.validate({ server: 'localhost' });

		// [valid non-IP server, no service] result
		expect(result).toBe(true);

		result = instance.validate({ server: '' });

		// [invalid non-IP server] result
		expect(result).toEqual(['Invalid server address or port']);

		result = instance.validate({
			server: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
		});

		// [too long non-IP server] result
		expect(result).toEqual(['Invalid server address or port']);

		result = instance.validate({
			server: 'localhost',
			service: 'test_service'
		});

		// [valid non-IP server, valid service] result
		expect(result).toBe(true);

		result = instance.validate({
			server: 'localhost',
			service: 'test service'
		});

		// [valid non-IP server, invalid service] result
		expect(result).toEqual(['Invalid server address or service setting']);

		result = instance.validate({
			server: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
			service: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
		});

		// [valid non-IP server and service, but sum of both length is too long] result
		expect(result).toEqual(['Invalid server address or service setting']);

		const getPeerThenSpy = jest.fn(() => 'getPeerThen_result');
		const getPeerSpy = jest.fn(() => ({
			then: getPeerThenSpy
		}));

		wrapper.setProps({
			peers: new Map([
				['test_1', { id: 1 }],
				['test_2', { id: 2 }]
			]),
			upstreamsApi: {
				getPeer: getPeerSpy
			}
		});
		result = instance.validate({});

		// [peers.size > 1] result
		expect(result).toBe('getPeerThen_result');
		// upstreamsApi.getPeer called
		expect(getPeerSpy).toHaveBeenCalled();
		// upstreamsApi.getPeer call args
		expect(getPeerSpy).toHaveBeenLastCalledWith('upstream_test', { id: 1 });
		// upstreamsApi.getPeer "then" called
		expect(getPeerThenSpy).toHaveBeenCalled();
		expect(getPeerThenSpy.mock.calls[0][0]).toBeInstanceOf(Function);
		expect(getPeerThenSpy.mock.calls[0][0]({})).toBeUndefined();
		// upstreamsApi.getPeer "then" callback, with error
		expect(getPeerThenSpy.mock.calls[0][0]({ error: true })).toEqual(['No such server (please, check if it still exists)']);

		wrapper.setProps({ peers: null });
		result = instance.validate({ server: '127.0.0.1' });

		// [no peers] result
		expect(result).toBe(true);

		result = instance.validate({});

		// [props.isStream = true, invalid non-IP server] result
		expect(result).toEqual(['Invalid server address or port']);

		wrapper.setProps({ isStream: true });
		result = instance.validate({ server: 'localhost' });

		// [props.isStream = true, invalid non-IP server] result
		expect(result).toEqual(['Invalid server address or port']);

		result = instance.validate({ server: 'localhost:1234' });

		// [props.isStream = true, invalid non-IP server] result
		expect(result).toBe(true);

		Promise.resolve.mockRestore();
		Promise.reject.mockRestore();
		wrapper.unmount();
	});

	it('validateServerName()', () => {
		const wrapper = shallow(<UpstreamsEditor {...props} />);
		const instance = wrapper.instance();
		const setStateSpy = jest.spyOn(instance, 'setState').mockClear();

		instance.validateServerName({ target: { value: '127.0.0.1' } });

		// this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			addAsDomain: false
		});

		setStateSpy.mockReset();
		instance.validateServerName({ target: { value: 'example.com' } });

		// this.setState called
		expect(setStateSpy).toHaveBeenCalled();
		// this.setState call args
		expect(setStateSpy.mock.calls[0][0]).toEqual({
			addAsDomain: true
		});

		setStateSpy.mockRestore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<UpstreamsEditor
				{...props}
				peers={null}
				isStream
			/>
		);
		const data = {
			server: 'localhost',
			backup: 'backup_test',
			weight: 'weight_test',
			max_conns: 'max_conns_test',
			max_fails: 'max_fails_test',
			fail_timeout: 'fail_timeout_test',
			slow_start: 'slow_start_test',
			service: 'service_test',
			down: true,
			route: 'route_test',
			drain: true
		};

		wrapper.setState({ data });

		const instance = wrapper.instance();

		// wrapper name
		expect(wrapper.name()).toBe('Popup');
		// wrapper className
		expect(wrapper.prop('className')).toBe(styles.editor);

		const popup = wrapper.childAt(0);

		// title className
		expect(wrapper.childAt(0).prop('className')).toBe(styles.header);
		// title text
		expect(wrapper.childAt(0).text()).toBe('Add server to "upstream_test"');
		// close el className
		expect(wrapper.childAt(1).prop('className')).toBe(styles.close);
		expect(wrapper.childAt(1).prop('onClick')).toBeInstanceOf(Function);
		// close el onClick name
		expect(wrapper.childAt(1).prop('onClick').name).toBe('bound close');

		let content = wrapper.childAt(2).childAt(0);

		// content className
		expect(content.prop('className')).toBe(styles.content);
		// [errorMessages = null] content children count
		expect(content.children()).toHaveLength(3);

		let serversGroup = content.childAt(0);

		expect(serversGroup.prop('className')).toBeUndefined();
		// [no data.host, isStream, isAdd] serves group elements count
		expect(serversGroup.children()).toHaveLength(2);
		// server address className
		expect(serversGroup.childAt(0).prop('className')).toBe(styles['form-group']);
		// server address, label html tag
		expect(serversGroup.childAt(0).childAt(0).type()).toBe('label');
		// server address, label htmlFor
		expect(serversGroup.childAt(0).childAt(0).prop('htmlFor')).toBe('server');
		// server address, input html tag
		expect(serversGroup.childAt(0).childAt(1).type()).toBe('input');
		// server address, input prop id
		expect(serversGroup.childAt(0).childAt(1).prop('id')).toBe('server');
		// server address, input prop name
		expect(serversGroup.childAt(0).childAt(1).prop('name')).toBe('server');
		// server address, input prop type
		expect(serversGroup.childAt(0).childAt(1).prop('type')).toBe('text');
		// server address, input prop className
		expect(serversGroup.childAt(0).childAt(1).prop('className')).toBe(styles.input);
		// server address, input prop value
		expect(serversGroup.childAt(0).childAt(1).prop('value')).toBe('localhost');
		expect(serversGroup.childAt(0).childAt(1).prop('onKeyUp')).toBeInstanceOf(Function);
		// server address, input prop onKeyUp name
		expect(serversGroup.childAt(0).childAt(1).prop('onKeyUp').name).toBe('bound validateServerName');
		expect(serversGroup.childAt(0).childAt(1).prop('onInput')).toBeInstanceOf(Function);
		// server address, input prop onInput name
		expect(serversGroup.childAt(0).childAt(1).prop('onInput').name).toBe('bound handleFormChange');
		// server address, input prop disabled
		expect(serversGroup.childAt(0).childAt(1).prop('disabled')).toBe(false);
		// backup server className
		expect(serversGroup.childAt(1).prop('className')).toBe(styles.checkbox);
		// backup server, label
		expect(serversGroup.childAt(1).childAt(0).type()).toBe('label');
		// backup server, input
		expect(serversGroup.childAt(1).childAt(0).childAt(0).type()).toBe('input');
		// backup server, input prop name
		expect(serversGroup.childAt(1).childAt(0).childAt(0).prop('name')).toBe('backup');
		// backup server, input prop type
		expect(serversGroup.childAt(1).childAt(0).childAt(0).prop('type')).toBe('checkbox');
		// backup server, input prop checked
		expect(serversGroup.childAt(1).childAt(0).childAt(0).prop('checked')).toBe('backup_test');
		expect(serversGroup.childAt(1).childAt(0).childAt(0).prop('onChange')).toBeInstanceOf(Function);
		// server address, input prop onChange name
		expect(serversGroup.childAt(1).childAt(0).childAt(0).prop('onChange').name).toBe('bound handleFormChange');

		let formsMini = content.childAt(1);

		// forms-mini className
		expect(formsMini.prop('className')).toBe(styles['forms-mini']);
		// [isAdd, not state.addAsDomain] forms-mini children count
		expect(formsMini.children()).toHaveLength(4);
		// forms-mini, weight group className
		expect(formsMini.childAt(0).prop('className')).toBe(styles['form-group']);
		// forms-mini, weight label
		expect(formsMini.childAt(0).childAt(0).type()).toBe('label');
		// forms-mini, weight label htmlFor
		expect(formsMini.childAt(0).childAt(0).prop('htmlFor')).toBe('weight');
		// forms-mini, weight input
		expect(formsMini.childAt(0).childAt(1).name()).toBe('NumberInput');
		// forms-mini, weight input prop id
		expect(formsMini.childAt(0).childAt(1).prop('id')).toBe('weight');
		// forms-mini, weight input prop name
		expect(formsMini.childAt(0).childAt(1).prop('name')).toBe('weight');
		// forms-mini, weight input prop className
		expect(formsMini.childAt(0).childAt(1).prop('className')).toBe(styles.input);
		expect(formsMini.childAt(0).childAt(1).prop('onInput')).toBeInstanceOf(Function);
		// forms-mini, weight input prop onInput name
		expect(formsMini.childAt(0).childAt(1).prop('onInput').name).toBe('bound handleFormChange');
		// forms-mini, weight input prop value
		expect(formsMini.childAt(0).childAt(1).prop('value')).toBe('weight_test');
		// forms-mini, max_conns group className
		expect(formsMini.childAt(1).prop('className')).toBe(styles['form-group']);
		// forms-mini, max_conns label
		expect(formsMini.childAt(1).childAt(0).type()).toBe('label');
		// forms-mini, max_conns label htmlFor
		expect(formsMini.childAt(1).childAt(0).prop('htmlFor')).toBe('max_conns');
		// forms-mini, max_conns input
		expect(formsMini.childAt(1).childAt(1).name()).toBe('NumberInput');
		// forms-mini, max_conns input prop id
		expect(formsMini.childAt(1).childAt(1).prop('id')).toBe('max_conns');
		// forms-mini, max_conns input prop name
		expect(formsMini.childAt(1).childAt(1).prop('name')).toBe('max_conns');
		// forms-mini, max_conns input prop className
		expect(formsMini.childAt(1).childAt(1).prop('className')).toBe(styles.input);
		expect(formsMini.childAt(1).childAt(1).prop('onInput')).toBeInstanceOf(Function);
		// forms-mini, max_conns input prop onInput name
		expect(formsMini.childAt(1).childAt(1).prop('onInput').name).toBe('bound handleFormChange');
		// forms-mini, max_conns input prop value
		expect(formsMini.childAt(1).childAt(1).prop('value')).toBe('max_conns_test');
		// forms-mini, max_fails group className
		expect(formsMini.childAt(2).prop('className')).toBe(styles['form-group']);
		// forms-mini, max_fails label
		expect(formsMini.childAt(2).childAt(0).type()).toBe('label');
		// forms-mini, max_fails label htmlFor
		expect(formsMini.childAt(2).childAt(0).prop('htmlFor')).toBe('max_fails');
		// forms-mini, max_fails input
		expect(formsMini.childAt(2).childAt(1).name()).toBe('NumberInput');
		// forms-mini, max_fails input prop id
		expect(formsMini.childAt(2).childAt(1).prop('id')).toBe('max_fails');
		// forms-mini, max_fails input prop name
		expect(formsMini.childAt(2).childAt(1).prop('name')).toBe('max_fails');
		// forms-mini, max_fails input prop className
		expect(formsMini.childAt(2).childAt(1).prop('className')).toBe(styles.input);
		expect(formsMini.childAt(2).childAt(1).prop('onInput')).toBeInstanceOf(Function);
		// forms-mini, max_fails input prop onInput name
		expect(formsMini.childAt(2).childAt(1).prop('onInput').name).toBe('bound handleFormChange');
		// forms-mini, max_fails input prop value
		expect(formsMini.childAt(2).childAt(1).prop('value')).toBe('max_fails_test');
		// forms-mini, fail_timeout group className
		expect(formsMini.childAt(3).prop('className')).toBe(styles['form-group']);
		// forms-mini, fail_timeout label
		expect(formsMini.childAt(3).childAt(0).type()).toBe('label');
		// forms-mini, fail_timeout label htmlFor
		expect(formsMini.childAt(3).childAt(0).prop('htmlFor')).toBe('fail_timeout');
		// forms-mini, fail_timeout input
		expect(formsMini.childAt(3).childAt(1).name()).toBe('NumberInput');
		// forms-mini, fail_timeout input prop id
		expect(formsMini.childAt(3).childAt(1).prop('id')).toBe('fail_timeout');
		// forms-mini, fail_timeout input prop name
		expect(formsMini.childAt(3).childAt(1).prop('name')).toBe('fail_timeout');
		// forms-mini, fail_timeout input prop className
		expect(formsMini.childAt(3).childAt(1).prop('className')).toBe(styles.input);
		expect(formsMini.childAt(3).childAt(1).prop('onInput')).toBeInstanceOf(Function);
		// forms-mini, fail_timeout input prop onInput name
		expect(formsMini.childAt(3).childAt(1).prop('onInput').name).toBe('bound handleFormChange');
		// forms-mini, fail_timeout input prop value
		expect(formsMini.childAt(3).childAt(1).prop('value')).toBe('fail_timeout_test');
		let radio = content.childAt(2);

		// radio group className
		expect(radio.prop('className')).toBe(styles.radio);
		// [isStream] radio group children count
		expect(radio.children()).toHaveLength(3);
		// radio, title className
		expect(radio.childAt(0).prop('className')).toBe(styles.title);
		// radio, state up label
		expect(radio.childAt(1).type()).toBe('label');
		// radio, state up input
		expect(radio.childAt(1).childAt(0).type()).toBe('input');
		// radio, state up input, prop name
		expect(radio.childAt(1).childAt(0).prop('name')).toBe('state');
		// radio, state up input, prop value
		expect(radio.childAt(1).childAt(0).prop('value')).toBe('false');
		// radio, state up input, prop type
		expect(radio.childAt(1).childAt(0).prop('type')).toBe('radio');
		expect(radio.childAt(1).childAt(0).prop('onChange')).toBeInstanceOf(Function);
		// radio, state up input, prop onChange name
		expect(radio.childAt(1).childAt(0).prop('onChange').name).toBe('bound handleRadioChange');
		// radio, state up input, prop checked
		expect(radio.childAt(1).childAt(0).prop('checked')).toBe(false);
		// radio, state down input
		expect(radio.childAt(2).childAt(0).type()).toBe('input');
		// radio, state down input, prop name
		expect(radio.childAt(2).childAt(0).prop('name')).toBe('state');
		// radio, state down input, prop value
		expect(radio.childAt(2).childAt(0).prop('value')).toBe('true');
		// radio, state down input, prop type
		expect(radio.childAt(2).childAt(0).prop('type')).toBe('radio');
		expect(radio.childAt(2).childAt(0).prop('onChange')).toBeInstanceOf(Function);
		// radio, state down input, prop onChange name
		expect(radio.childAt(2).childAt(0).prop('onChange').name).toBe('bound handleRadioChange');
		// radio, state down input, prop checked
		expect(radio.childAt(2).childAt(0).prop('checked')).toBe(true);

		let footer = wrapper.childAt(2).childAt(1);

		// footer className
		expect(footer.prop('className')).toBe(styles.footer);
		// [isAdd = true] footer childs count
		expect(footer.children()).toHaveLength(2);
		// footer, save className
		expect(footer.childAt(0).prop('className')).toBe(styles.save);
		expect(footer.childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// footer, save onClick name
		expect(footer.childAt(0).prop('onClick').name).toBe('bound save');
		// footer, save text
		expect(footer.childAt(0).text()).toBe('Add');
		// footer, cancel className
		expect(footer.childAt(1).prop('className')).toBe(styles.cancel);
		expect(footer.childAt(1).prop('onClick')).toBeInstanceOf(Function);
		// footer, cancel onClick name
		expect(footer.childAt(1).prop('onClick').name).toBe('bound close');

		wrapper.setProps({ isStream: false });
		data.host = 'host_test';
		wrapper.setState({
			data,
			addAsDomain: true
		});

		content = wrapper.childAt(2).childAt(0);
		serversGroup = content.childAt(0);

		// [with data.host, isStream = false, isAdd] serves group elements count
		expect(serversGroup.children()).toHaveLength(3);
		// [with data.host] server address, input prop disabled
		expect(serversGroup.childAt(0).childAt(1).prop('disabled')).toBe(true);
		// domain name className
		expect(serversGroup.childAt(1).prop('className')).toBe(styles['form-group']);
		// domain name text
		expect(serversGroup.childAt(1).text()).toBe('Domain name: host_test');

		formsMini = content.childAt(1);

		// [isAdd, state.addAsDomain] forms-mini children count
		expect(formsMini.children()).toHaveLength(4);

		radio = content.childAt(2);

		// [isStream = false] radio group children count
		expect(radio.children()).toHaveLength(3);

		wrapper.setProps({ peers: new Map([
			['test_1', {
				id: 'test_1',
				server: 'test_server_1'
			}]
		]) });
		wrapper.setState({
			data,
			loading: false,
			errorMessages: ['error_1', 'error_2']
		});

		// [peers.length = 1] title text
		expect(wrapper.childAt(0).childAt(0).text()).toBe('Edit server test_server_1 "upstream_test"');

		content = wrapper.childAt(2).childAt(0);

		// [with errorMessages] content children count
		expect(content.children()).toHaveLength(4);

		serversGroup = content.childAt(0);

		expect(serversGroup.prop('className')).toBeUndefined();
		// [with data.host, isStream = false, isAdd = false] serves group elements count
		expect(serversGroup.children()).toHaveLength(1);
		// [isAdd = false, state.addAsDomain] forms-mini children count
		expect(formsMini.children()).toHaveLength(4);
		// error messages className
		expect(content.childAt(3).prop('className')).toBe(styles.error);
		// error messages, close className
		expect(content.childAt(3).childAt(0).prop('className')).toBe(styles['error-close']);
		expect(content.childAt(3).childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// error messages, close onClick name
		expect(content.childAt(3).childAt(0).prop('onClick').name).toBe('bound closeErrors');
		// error messages, error 1
		expect(content.childAt(3).childAt(1).text()).toBe('error_1');
		// error messages, error 2
		expect(content.childAt(3).childAt(2).text()).toBe('error_2');

		footer = wrapper.childAt(2).childAt(1);

		// [isAdd = false] footer childs count
		expect(footer.children()).toHaveLength(3);
		// footer, remove className
		expect(footer.childAt(0).prop('className')).toBe(styles.remove);
		expect(footer.childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// footer, remove onClick name
		expect(footer.childAt(0).prop('onClick').name).toBe('bound remove');
		// footer, save text
		expect(footer.childAt(1).text()).toBe('Save');

		wrapper.setProps({ peers: new Map([
			['test_1', {
				id: 'test_1',
				server: 'test_server_1'
			}], ['test_2', {
				id: 'test_2',
				server: 'test_server_2'
			}]
		]) });

		// [peers.length = 1] title text
		expect(wrapper.childAt(0).childAt(0).text()).toBe('Edit servers "upstream_test"');

		content = wrapper.childAt(2).childAt(0);
		serversGroup = content.childAt(0);

		// [isAdd = false, peers.size = 2] server groups className
		expect(serversGroup.prop('className')).toBe(styles['form-group']);
		// servers list, child 1
		expect(serversGroup.childAt(0).type()).toBe('label');
		// servers list, child 2
		expect(serversGroup.childAt(1).type()).toBe('ul');
		// servers list, child 2 className
		expect(serversGroup.childAt(1).prop('className')).toBe(styles['servers-list']);
		// servers list, child 2, childs size
		expect(serversGroup.childAt(1).children()).toHaveLength(2);
		// servers list, child 2, child 1
		expect(serversGroup.childAt(1).childAt(0).type()).toBe('li');
		// servers list, child 2, child 1 text
		expect(serversGroup.childAt(1).childAt(0).text()).toBe('test_server_1');
		// servers list, child 2, child 2
		expect(serversGroup.childAt(1).childAt(1).type()).toBe('li');
		// servers list, child 2, child 2 text
		expect(serversGroup.childAt(1).childAt(1).text()).toBe('test_server_2');

		wrapper.setState({ loading: true });

		content = wrapper.childAt(2);

		// [state.loading = true] content className
		expect(content.prop('className')).toBe(styles.content);
		// Loader
		expect(content.childAt(0).name()).toBe('Loader');
		// Loader className
		expect(content.childAt(0).prop('className')).toBe(styles.loader);
		// Loader prop gray
		expect(content.childAt(0).prop('gray')).toBe(true);

		wrapper.setState({
			loading: false,
			success: true,
			successMessage: 'success message test'
		});

		content = wrapper.childAt(2).childAt(0);

		// [state.success = true] content className
		expect(content.prop('className')).toBe(styles.content);
		// [state.success = true] content text
		expect(content.text()).toBe('success message test');

		footer = wrapper.childAt(2).childAt(1);

		// [state.success = true] footer
		expect(footer.prop('className')).toBe(styles.footer);
		// [state.success = true] footer, save className
		expect(footer.childAt(0).prop('className')).toBe(styles.save);
		expect(footer.childAt(0).prop('onClick')).toBeInstanceOf(Function);
		// [state.success = true] footer, save onClick
		expect(footer.childAt(0).prop('onClick').name).toBe('bound close');

		wrapper.unmount();
	});
});
