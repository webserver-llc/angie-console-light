/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';
import UpstreamsEditor from '../upstreamseditor.jsx';
import styles from '../style.css';

describe('<UpstreamsEditor />', () => {
	it('normalizeInputData()', () => {
		const data = {
			test_prop_1: '123',
			fail_timeout: '5s',
			slow_start: '900s'
		};
		const parsedData = UpstreamsEditor.normalizeInputData(data);

		expect(parsedData.test_prop_1, 'test_prop_1').to.be.equal(data.test_prop_1);
		expect(parsedData.fail_timeout, 'fail_timeout').to.be.equal(5);
		expect(parsedData.slow_start, 'slow_start').to.be.equal(900);
	});

	it('normalizeOutputData()', () => {
		const data = {
			test_prop_1: '123',
			fail_timeout: 5,
			slow_start: 900,
			server: 'test_server',
			id: 1,
			host: 'test_host'
		};
		let parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server_1' });

		expect(parsedData.test_prop_1, 'test_prop_1').to.be.equal(data.test_prop_1);
		expect(parsedData.fail_timeout, 'fail_timeout').to.be.equal('5s');
		expect(parsedData.slow_start, 'slow_start').to.be.equal('900s');
		expect('server' in parsedData, '[data.server != initialData.server] server').to.be.true;
		expect(parsedData.id, 'id').to.be.an('undefined');
		expect('host' in parsedData, '[no parent] host').to.be.true;

		parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server' });

		expect(parsedData.server, '[data.server = initialData.server] server').to.be.an('undefined');

		data.parent = 'parent_test';
		parsedData = UpstreamsEditor.normalizeOutputData(data, { server: 'test_server_1' });

		expect(parsedData.parent, '[with parent] parent').to.be.an('undefined');
		expect(parsedData.host, '[with parent] host').to.be.an('undefined');
		expect(parsedData.server, '[with parent] server').to.be.an('undefined');
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
		const validateServerNameSpy = spy(UpstreamsEditor.prototype.validateServerName, 'bind');
		const handleFormChangeSpy = spy(UpstreamsEditor.prototype.handleFormChange, 'bind');
		const handleRadioChangeSpy = spy(UpstreamsEditor.prototype.handleRadioChange, 'bind');
		const validateSpy = spy(UpstreamsEditor.prototype.validate, 'bind');
		const saveSpy = spy(UpstreamsEditor.prototype.save, 'bind');
		const closeSpy = spy(UpstreamsEditor.prototype.close, 'bind');
		const removeSpy = spy(UpstreamsEditor.prototype.remove, 'bind');
		const closeErrorsSpy = spy(UpstreamsEditor.prototype.closeErrors, 'bind');

		let wrapper = shallow(
			<UpstreamsEditor { ...Object.assign({}, props, {
				peers: null
			}) } />
		);

		expect(wrapper.state(), '[no peers] this.state').to.be.deep.equal({
			success: false,
			loading: false,
			errorMessages: null,
			data: {},
			initialData: {}
		});

		expect(validateServerNameSpy.calledOnce, 'this.validateServerName.bind called once').to.be.true;
		expect(validateServerNameSpy.args[0][0] instanceof UpstreamsEditor, 'this.validateServerName.bind arg').to.be.true;
		expect(handleFormChangeSpy.calledOnce, 'this.handleFormChange.bind called once').to.be.true;
		expect(handleFormChangeSpy.args[0][0] instanceof UpstreamsEditor, 'this.handleFormChange.bind arg').to.be.true;
		expect(handleRadioChangeSpy.calledOnce, 'this.handleRadioChange.bind called once').to.be.true;
		expect(handleRadioChangeSpy.args[0][0] instanceof UpstreamsEditor, 'this.handleRadioChange.bind arg').to.be.true;
		expect(validateSpy.calledOnce, 'this.validate.bind called once').to.be.true;
		expect(validateSpy.args[0][0] instanceof UpstreamsEditor, 'this.validate.bind arg').to.be.true;
		expect(saveSpy.calledOnce, 'this.save.bind called once').to.be.true;
		expect(saveSpy.args[0][0] instanceof UpstreamsEditor, 'this.save.bind arg').to.be.true;
		expect(closeSpy.calledOnce, 'this.close.bind called once').to.be.true;
		expect(closeSpy.args[0][0] instanceof UpstreamsEditor, 'this.close.bind arg').to.be.true;
		expect(removeSpy.calledOnce, 'this.remove.bind called once').to.be.true;
		expect(removeSpy.args[0][0] instanceof UpstreamsEditor, 'this.remove.bind arg').to.be.true;
		expect(closeErrorsSpy.calledOnce, 'this.closeErrors.bind called once').to.be.true;
		expect(closeErrorsSpy.args[0][0] instanceof UpstreamsEditor, 'this.closeErrors.bind arg').to.be.true;

		wrapper = shallow(
			<UpstreamsEditor { ...Object.assign({}, props, {
				peers: new Map()
			}) } />,
		);

		expect(wrapper.state(), '[no peers] this.state').to.be.deep.equal({
			success: false,
			loading: false,
			errorMessages: null
		});

		wrapper = shallow(
			<UpstreamsEditor { ...Object.assign({}, props, {
				peers: new Map([
					['test_1', {}],
					['test_2', {}],
					['test_3', {}]
				])
			}) } />
		);

		expect(wrapper.state('data'), '[peers.size > 1] this.state.data').to.be.deep.equal({});
		expect(wrapper.state('initialData'), '[peers.size > 1] this.state.initialData').to.be.deep.equal({});

		const thenSpy = spy();
		const getPeerSpy = spy(() => ({
			then: thenSpy
		}));

		wrapper = shallow(
			<UpstreamsEditor { ...Object.assign({}, props, {
				upstreamsApi: {
					getPeer: getPeerSpy
				}
			}) } />
		);

		expect(wrapper.state('loading'), '[peers.size = 1] this.state.loading').to.be.true;
		expect(wrapper.state('data'), '[peers.size = 1] this.state.data').to.be.an('undefined');
		expect(wrapper.state('initialData'), '[peers.size = 1] this.state.initialData').to.be.an('undefined');
		expect(getPeerSpy.calledOnce, 'upstreamsApi.getPeer called once').to.be.true;
		expect(getPeerSpy.calledWith('upstream_test', {
				id: 4,
				server: 'test_server_4'
			}), 'upstreamsApi.getPeer call args').to.be.true;
		expect(thenSpy.calledOnce, 'upstreamsApi.getPeer().then called once').to.be.true;
		expect(thenSpy.args[0][0], 'upstreamsApi.getPeer().then call args').to.be.a('function');

		const setStateSpy = spy(wrapper.instance(), 'setState');
		const peerData = {
			should_be_normilized: true,
			and_passed_to: 'state'
		};

		stub(UpstreamsEditor, 'normalizeInputData').callsFake(data => ({
			...data,
			normalized_by_normalizeInputData: true
		}));
		thenSpy.args[0][0](peerData);

		expect(
			UpstreamsEditor.normalizeInputData.calledOnce,
			'UpstreamsEditor.normalizeInputData called once'
		).to.be.true;
		expect(
			UpstreamsEditor.normalizeInputData.args[0][0],
			'UpstreamsEditor.normalizeInputData call args'
		).to.be.deep.equal(peerData);
		expect(setStateSpy.calledOnce, 'this.setState called once').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
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

		UpstreamsEditor.normalizeInputData.restore();

		validateServerNameSpy.restore();
		handleFormChangeSpy.restore();
		handleRadioChangeSpy.restore();
		validateSpy.restore();
		saveSpy.restore();
		closeSpy.restore();
		removeSpy.restore();
		closeErrorsSpy.restore();
	});

	it('handleFormChange()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();

		wrapper.setState({ data: {} });

		const setStateSpy = spy(instance, 'setState');

		instance.handleFormChange({ target: {
			name: 'form_field_1',
			type: 'checkbox',
			checked: false
		} });

		expect(setStateSpy.calledOnce, '[checkbox changed] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[checkbox changed] this.setState call args').to.be.deep.equal({
			data: {
				form_field_1: false
			}
		});

		setStateSpy.resetHistory();
		instance.handleFormChange({ target: {
			name: 'form_field_2',
			type: 'text',
			value: 'test value 2'
		} });

		expect(setStateSpy.calledOnce, '[text input changed] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[text input changed] this.setState call args').to.be.deep.equal({
			data: {
				form_field_1: false,
				form_field_2: 'test value 2'
			}
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('handleRadioChange()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();

		wrapper.setState({ data: {
			down: true
		} });

		const setStateSpy = spy(instance, 'setState');

		instance.handleRadioChange({ target: {
			id: 'drain'
		} });

		expect(setStateSpy.calledOnce, '[drain change] this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], '[drain change] this.setState call args').to.be.deep.equal({
			data: { drain: true }
		});

		setStateSpy.resetHistory();
		instance.handleRadioChange({ target: {
			id: 'test_id',
			value: 'true'
		} });

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			data: { down: true }
		});

		setStateSpy.restore();
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
		const updatePeerSpy = spy((_, { server }) => `updatePeer_result_${ server }`);
		const wrapper = shallow(<UpstreamsEditor
			{ ...props }
			upstreamsApi={{
				getPeer(){
					return Promise.resolve({});
				},
				updatePeer: updatePeerSpy
			}}
		/>);
		let instance = wrapper.instance();

		wrapper.setState({ data, initialData });

		const setStateSpy = spy(instance, 'setState');
		const catchSpy = spy();
		const nextThenSpy = spy(() => ({
			catch: catchSpy
		}));
		const thenSpy = spy(() => ({
			then: nextThenSpy
		}));

		stub(instance, 'closeErrors').callsFake(() => {});
		stub(instance, 'validate').callsFake(() => ({
			then: thenSpy
		}));
		stub(UpstreamsEditor, 'normalizeOutputData').callsFake(data => ({
			...data,
			normalized_by_normalizeOutputData: true
		}));

		instance.save();

		expect(instance.closeErrors.calledOnce, 'this.closeErrors called once').to.be.true;
		expect(setStateSpy.calledOnce, 'this.setState called once').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			loading: true
		});
		expect(instance.validate.calledOnce, 'this.validate called once').to.be.true;
		expect(instance.validate.args[0][0], 'this.validate call args').to.be.deep.equal(data);
		expect(thenSpy.calledOnce, 'this.validate, first "then" called').to.be.true;
		expect(thenSpy.args[0][0], 'this.validate, first "then" call arg').to.be.a('function');

		const promiseAllThenSpy = spy(() => 'promise_all_result');

		stub(Promise, 'all').callsFake(() => ({
			then: promiseAllThenSpy
		}));

		expect(
			thenSpy.args[0][0](),
			'this.validate, first "then" callback result'
		).to.be.equal('promise_all_result');
		expect(
			Promise.all.calledOnce,
			'this.validate, first "then" cb, Promise.all called'
		).to.be.true;
		expect(
			Promise.all.args[0][0],
			'this.validate, first "then" cb, Promise.all call args'
		).to.be.deep.equal([ 'updatePeer_result_test_server_4' ]);
		expect(updatePeerSpy.calledOnce, 'upstreamsApi.updatePeer called once').to.be.true;
		expect(
			updatePeerSpy.calledWith('upstream_test', {
				id: 4,
				server: 'test_server_4'
			}, {
				...data,
				normalized_by_normalizeOutputData: true
			}),
			'upstreamsApi.updatePeer call args'
		).to.be.true;
		expect(
			UpstreamsEditor.normalizeOutputData.calledOnce,
			'UpstreamsEditor.normalizeOutputData called once'
		).to.be.true;
		expect(
			UpstreamsEditor.normalizeOutputData.calledWith(
				data, initialData
			),
			'UpstreamsEditor.normalizeOutputData call args'
		).to.be.true;
		expect(promiseAllThenSpy.calledOnce, 'Promise.all, first "then" called').to.be.true;
		expect(promiseAllThenSpy.args[0][0], 'Promise.all, first "then" call arg').to.be.a('function');

		setStateSpy.resetHistory();
		promiseAllThenSpy.args[0][0]();

		expect(
			setStateSpy.calledOnce,
			'Promise.all, first "then", this.setState called once'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'Promise.all, first "then", this.setState call args'
		).to.be.deep.equal({
			success: true,
			successMessage: 'Changes saved'
		});
		expect(nextThenSpy.calledOnce, 'this.validate, second "then" called').to.be.true;
		expect(nextThenSpy.args[0][0], 'this.validate, second "then" call arg').to.be.a('function');

		setStateSpy.resetHistory();
		nextThenSpy.args[0][0]();

		expect(
			setStateSpy.calledOnce,
			'this.validate, second "then", this.setState called once'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'this.validate, second "then", this.setState call args'
		).to.be.deep.equal({
			loading: false
		});
		expect(catchSpy.calledOnce, 'this.validate, catch called').to.be.true;
		expect(catchSpy.args[0][0], 'this.validate, catch call arg').to.be.a('function');

		stub(instance, 'showErrors').callsFake(() => {});
		catchSpy.args[0][0]({ error: 'test error' });

		expect(
			instance.showErrors.calledOnce,
			'this.validate, catch call, this.showErrors called'
		).to.be.true;
		expect(
			instance.showErrors.args[0][0],
			'this.validate, catch call, this.showErrors call args'
		).to.be.deep.equal([ 'test error' ]);

		instance.showErrors.resetHistory();
		catchSpy.args[0][0](['test error', 'another test error']);

		expect(
			instance.showErrors.calledOnce,
			'this.validate, catch call, this.showErrors called'
		).to.be.true;
		expect(
			instance.showErrors.args[0][0],
			'this.validate, catch call, this.showErrors call args'
		).to.be.deep.equal(['test error', 'another test error']);

		const createPeerThenSpy = spy(() => 'create_peer_result');
		const createPeerSpy = spy(() => ({
			then: createPeerThenSpy
		}));

		thenSpy.resetHistory();
		Promise.all.resetHistory();
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

		expect(thenSpy.calledOnce, '[isAdd = true] this.validate, first "then" called').to.be.true;
		expect(
			thenSpy.args[0][0],
			'[isAdd = true] this.validate, first "then" call arg'
		).to.be.a('function');
		expect(
			thenSpy.args[0][0](),
			'[isAdd = true] this.validate, first "then" callback result'
		).to.be.equal('create_peer_result');
		expect(createPeerSpy.calledOnce, 'upstreamsApi.createPeer called').to.be.true;
		expect(
			createPeerSpy.args[0][0],
			'upstreamsApi.createPeer call 1st arg'
		).to.be.equal('upstream_test');
		expect(
			createPeerSpy.args[0][1],
			'upstreamsApi.createPeer call 2nd arg'
		).to.be.deep.equal(wrapper.state('data'));
		expect(createPeerThenSpy.calledOnce, 'createPeer, 1st "then" cb called').to.be.true;
		expect(createPeerThenSpy.args[0][0], 'createPeer, 1st "then" cb call arg').to.be.a('function');

		setStateSpy.resetHistory();
		createPeerThenSpy.args[0][0]();

		expect(
			setStateSpy.calledOnce,
			'createPeer, 1st "then" cb, this.setState called'
		).to.be.true;
		expect(
			setStateSpy.args[0][0],
			'createPeer, 1st "then" cb, this.setState call args'
		).to.be.deep.equal({
			success: true,
			successMessage: 'Server added successfully'
		});
		expect(
			Promise.all.notCalled,
			'this.validate, first "then" cb, Promise.all not called'
		).to.be.true;

		Promise.all.restore();
		instance.showErrors.restore();
		setStateSpy.restore();
		instance.closeErrors.restore();
		instance.validate.restore();
		UpstreamsEditor.normalizeOutputData.restore();
		wrapper.unmount();
	});

	it('closeErrors()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.closeErrors();

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			errorMessages: null
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('showErrors()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');
		const errorMessages = ['error_1', 'error_2'];

		instance.showErrors(errorMessages);

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			errorMessages,
			loading: false
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('close()', () => {
		const onCloseSpy = spy();
		const wrapper = shallow(
			<UpstreamsEditor
				{ ...props }
				onClose={ onCloseSpy }
			/>);
		const instance = wrapper.instance();

		instance.close();

		expect(onCloseSpy.calledOnce, 'this.props.onClose called').to.be.true;

		wrapper.unmount();
	});

	it('remove()', () => {
		const deletePeerThenSpy = spy(() => 'deletePeer_result');
		const deletePeerSpy = spy((_, id) => ({
			then: deletePeerThenSpy
		}));
		const wrapper = shallow(
			<UpstreamsEditor
				{ ...props }
				upstreamsApi={{
					getPeer(){
						return Promise.resolve({});
					},
					deletePeer: deletePeerSpy
				}}
			/>
		);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');
		const catchSpy = spy();
		const thenSpy = spy(() => ({
			catch: catchSpy
		}))

		stub(Promise, 'all').callsFake(() => ({
			then: thenSpy
		}));
		stub(instance, 'showErrors').callsFake(() => 'showErrors_result');

		instance.remove();

		expect(Promise.all.calledOnce, 'Promise.all called').to.be.true;
		expect(Promise.all.args[0][0], 'Promise.all call args').to.be.deep.equal([
			'deletePeer_result'
		]);
		expect(deletePeerSpy.calledOnce, 'upstreamsApi.deletePeer called').to.be.true;
		expect(
			deletePeerSpy.calledWith('upstream_test', {
				id: 4,
				server: 'test_server_4'
			}),
			'upstreamsApi.deletePeer call args'
		).to.be.true;
		expect(deletePeerThenSpy.calledOnce, 'upstreamsApi.deletePeer "then" called').to.be.true;
		expect(
			deletePeerThenSpy.args[0][0],
			'upstreamsApi.deletePeer "then" call arg'
		).to.be.a('function');
		expect(
			deletePeerThenSpy.args[0][0](),
			'upstreamsApi.deletePeer "then" call arg result'
		).to.be.equal('test_server_4');
		expect(thenSpy.calledOnce, 'Promise.all, "then" called').to.be.true;
		expect(thenSpy.args[0][0], 'Promise.all, "then" call arg').to.be.a('function');

		thenSpy.args[0][0](['1', '2', '3']);

		expect(setStateSpy.calledOnce, 'this.setState called once').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			success: true,
			successMessage: `Servers 1, 2, 3 successfully removed`
		});
		expect(catchSpy.calledOnce, 'Promise.all, "catch" called').to.be.true;
		expect(catchSpy.args[0][0], 'Promise.all, "catch" call arg').to.be.a('function');

		setStateSpy.resetHistory();
		expect(
			catchSpy.args[0][0]({ error: 'test_error' }),
			'Promise.all, "catch" callback result'
		).to.be.equal('showErrors_result');
		expect(instance.showErrors.calledOnce, 'this.showErrors called once').to.be.true;
		expect(instance.showErrors.args[0][0], 'this.showErrors call args').to.be.deep.equal([
			'test_error'
		]);

		Promise.all.restore();
		instance.showErrors.restore();
		setStateSpy.restore();
		wrapper.unmount();
	});

	it('validate()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();

		stub(Promise, 'resolve').callsFake(() => true);
		stub(Promise, 'reject').callsFake(errors => errors);

		let result = instance.validate({});

		expect(result, '[empty data] result').to.be.true;

		result = instance.validate({ server: '127.0.0.1' });

		expect(result, '[server is IP] result').to.be.true;

		result = instance.validate({ server: 'localhost' });

		expect(result, '[valid non-IP server, no service] result').to.be.true;

		result = instance.validate({ server: '' });

		expect(result, '[invalid non-IP server] result').to.be.deep.equal(
			['Invalid server address or port']
		);

		result = instance.validate({
			server: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
		});

		expect(result, '[too long non-IP server] result').to.be.deep.equal(
			['Invalid server address or port']
		);

		result = instance.validate({
			server: 'localhost',
			service: 'test_service'
		});

		expect(result, '[valid non-IP server, valid service] result').to.be.true;

		result = instance.validate({
			server: 'localhost',
			service: 'test service'
		});

		expect(result, '[valid non-IP server, invalid service] result').to.be.deep.equal(
			['Invalid server address or service setting']
		);

		result = instance.validate({
			server: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
			service: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
		});

		expect(result, '[valid non-IP server and service, but sum of both length is too long] result').to.be.deep.equal(
			['Invalid server address or service setting']
		);

		const getPeerThenSpy = spy(() => 'getPeerThen_result');
		const getPeerSpy = spy(() => ({
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

		expect(result, '[peers.size > 1] result').to.be.equal('getPeerThen_result');
		expect(getPeerSpy.calledOnce, 'upstreamsApi.getPeer called').to.be.true;
		expect(
			getPeerSpy.calledWith('upstream_test', 'test_1'),
			'upstreamsApi.getPeer call args'
		).to.be.true;
		expect(getPeerThenSpy.calledOnce, 'upstreamsApi.getPeer "then" called').to.be.true;
		expect(getPeerThenSpy.args[0][0], 'upstreamsApi.getPeer "then" call arg').to.be.a('function');
		expect(
			getPeerThenSpy.args[0][0]({}),
			'upstreamsApi.getPeer "then" callback, without errors'
		).to.be.an('undefined');
		expect(
			getPeerThenSpy.args[0][0]({ error: true }),
			'upstreamsApi.getPeer "then" callback, with error'
		).to.be.deep.equal(
			['No such server (please, check if it still exists)']
		);

		wrapper.setProps({ peers: null });
		result = instance.validate({ server: '127.0.0.1' });

		expect(result, '[no peers] result').to.be.true;

		result = instance.validate({});

		expect(result, '[props.isStream = true, invalid non-IP server] result').to.be.deep.equal(
			['Invalid server address or port']
		);

		wrapper.setProps({ isStream: true });
		result = instance.validate({ server: 'localhost' });

		expect(result, '[props.isStream = true, invalid non-IP server] result').to.be.deep.equal(
			['Invalid server address or port']
		);

		result = instance.validate({ server: 'localhost:1234' });

		expect(result, '[props.isStream = true, invalid non-IP server] result').to.be.true;

		Promise.resolve.restore();
		Promise.reject.restore();
		wrapper.unmount();
	});

	it('validateServerName()', () => {
		const wrapper = shallow(<UpstreamsEditor { ...props } />);
		const instance = wrapper.instance();
		const setStateSpy = spy(instance, 'setState');

		instance.validateServerName({ target: { value: '127.0.0.1' } });

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			addAsDomain: false
		});

		setStateSpy.resetHistory();
		instance.validateServerName({ target: { value: 'example.com' } });

		expect(setStateSpy.calledOnce, 'this.setState called').to.be.true;
		expect(setStateSpy.args[0][0], 'this.setState call args').to.be.deep.equal({
			addAsDomain: true
		});

		setStateSpy.restore();
		wrapper.unmount();
	});

	it('render()', () => {
		const wrapper = shallow(
			<UpstreamsEditor
				{ ...props }
				peers={ null }
				isStream={ true }
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

		expect(wrapper.name(), 'wrapper name').to.be.equal('Popup');
		expect(wrapper.prop('className'), 'wrapper className').to.be.equal(styles['editor']);

		let popup = wrapper.childAt(0);

		expect(wrapper.childAt(0).prop('className'), 'title className').to.be.equal(
			styles['header']
		);
		expect(wrapper.childAt(0).text(), 'title text').to.be.equal('Add server to "upstream_test"');
		expect(wrapper.childAt(1).prop('className'), 'close el className').to.be.equal(
			styles['close']
		);
		expect(wrapper.childAt(1).prop('onClick'), 'close el onClick').to.be.a('function');
		expect(
			wrapper.childAt(1).prop('onClick').name,
			'close el onClick name'
		).to.be.equal('bound close');

		let content = wrapper.childAt(2).childAt(0);

		expect(content.prop('className'), 'content className').to.be.equal(styles['content']);
		expect(
			content.children(),
			'[errorMessages = null] content children count'
		).to.have.lengthOf(3);

		let serversGroup = content.childAt(0);

		expect(
			serversGroup.prop('className'),
			'[isAdd, no peers] server groups className'
		).to.be.an('undefined');
		expect(
			serversGroup.children(),
			'[no data.host, isStream, isAdd] serves group elements count'
		).to.have.lengthOf(2);
		expect(
			serversGroup.childAt(0).prop('className'),
			'server address className'
		).to.be.equal(styles['form-group']);
		expect(
			serversGroup.childAt(0).childAt(0).type(),
			'server address, label html tag'
		).to.be.equal('label');
		expect(
			serversGroup.childAt(0).childAt(0).prop('htmlFor'),
			'server address, label htmlFor'
		).to.be.equal('server');
		expect(
			serversGroup.childAt(0).childAt(1).type(),
			'server address, input html tag'
		).to.be.equal('input');
		expect(
			serversGroup.childAt(0).childAt(1).prop('id'),
			'server address, input prop id'
		).to.be.equal('server');
		expect(
			serversGroup.childAt(0).childAt(1).prop('name'),
			'server address, input prop name'
		).to.be.equal('server');
		expect(
			serversGroup.childAt(0).childAt(1).prop('type'),
			'server address, input prop type'
		).to.be.equal('text');
		expect(
			serversGroup.childAt(0).childAt(1).prop('className'),
			'server address, input prop className'
		).to.be.equal(styles['input']);
		expect(
			serversGroup.childAt(0).childAt(1).prop('value'),
			'server address, input prop value'
		).to.be.equal('localhost');
		expect(
			serversGroup.childAt(0).childAt(1).prop('onKeyUp'),
			'server address, input prop onKeyUp'
		).to.be.a('function');
		expect(
			serversGroup.childAt(0).childAt(1).prop('onKeyUp').name,
			'server address, input prop onKeyUp name'
		).to.be.equal('bound validateServerName');
		expect(
			serversGroup.childAt(0).childAt(1).prop('onInput'),
			'server address, input prop onInput'
		).to.be.a('function');
		expect(
			serversGroup.childAt(0).childAt(1).prop('onInput').name,
			'server address, input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			serversGroup.childAt(0).childAt(1).prop('disabled'),
			'server address, input prop disabled'
		).to.be.false;
		expect(
			serversGroup.childAt(1).prop('className'),
			'backup server className'
		).to.be.equal(styles['checkbox']);
		expect(
			serversGroup.childAt(1).childAt(0).type(),
			'backup server, label'
		).to.be.equal('label');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).type(),
			'backup server, input'
		).to.be.equal('input');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).prop('name'),
			'backup server, input prop name'
		).to.be.equal('backup');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).prop('type'),
			'backup server, input prop type'
		).to.be.equal('checkbox');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).prop('checked'),
			'backup server, input prop checked'
		).to.be.equal('backup_test');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).prop('onChange'),
			'server address, input prop onChange'
		).to.be.a('function');
		expect(
			serversGroup.childAt(1).childAt(0).childAt(0).prop('onChange').name,
			'server address, input prop onChange name'
		).to.be.equal('bound handleFormChange');

		let formsMini = content.childAt(1);

		expect(formsMini.prop('className'), 'forms-mini className').to.be.equal(styles['forms-mini']);
		expect(
			formsMini.children(),
			'[isAdd, not state.addAsDomain] forms-mini children count'
		).to.have.lengthOf(6);
		expect(
			formsMini.childAt(0).prop('className'),
			'forms-mini, weight group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(0).childAt(0).type(),
			'forms-mini, weight label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(0).childAt(0).prop('htmlFor'),
			'forms-mini, weight label htmlFor'
		).to.be.equal('weight');
		expect(
			formsMini.childAt(0).childAt(1).name(),
			'forms-mini, weight input'
		).to.be.equal('NumberInput');
		expect(
			formsMini.childAt(0).childAt(1).prop('id'),
			'forms-mini, weight input prop id'
		).to.be.equal('weight');
		expect(
			formsMini.childAt(0).childAt(1).prop('name'),
			'forms-mini, weight input prop name'
		).to.be.equal('weight');
		expect(
			formsMini.childAt(0).childAt(1).prop('className'),
			'forms-mini, weight input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(0).childAt(1).prop('onInput'),
			'forms-mini, weight input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(0).childAt(1).prop('onInput').name,
			'forms-mini, weight input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(0).childAt(1).prop('value'),
			'forms-mini, weight input prop value'
		).to.be.equal('weight_test');
		expect(
			formsMini.childAt(1).prop('className'),
			'forms-mini, max_conns group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(1).childAt(0).type(),
			'forms-mini, max_conns label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(1).childAt(0).prop('htmlFor'),
			'forms-mini, max_conns label htmlFor'
		).to.be.equal('max_conns');
		expect(
			formsMini.childAt(1).childAt(1).name(),
			'forms-mini, max_conns input'
		).to.be.equal('NumberInput');
		expect(
			formsMini.childAt(1).childAt(1).prop('id'),
			'forms-mini, max_conns input prop id'
		).to.be.equal('max_conns');
		expect(
			formsMini.childAt(1).childAt(1).prop('name'),
			'forms-mini, max_conns input prop name'
		).to.be.equal('max_conns');
		expect(
			formsMini.childAt(1).childAt(1).prop('className'),
			'forms-mini, max_conns input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(1).childAt(1).prop('onInput'),
			'forms-mini, max_conns input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(1).childAt(1).prop('onInput').name,
			'forms-mini, max_conns input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(1).childAt(1).prop('value'),
			'forms-mini, max_conns input prop value'
		).to.be.equal('max_conns_test');
		expect(
			formsMini.childAt(2).prop('className'),
			'forms-mini, max_fails group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(2).childAt(0).type(),
			'forms-mini, max_fails label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(2).childAt(0).prop('htmlFor'),
			'forms-mini, max_fails label htmlFor'
		).to.be.equal('max_fails');
		expect(
			formsMini.childAt(2).childAt(1).name(),
			'forms-mini, max_fails input'
		).to.be.equal('NumberInput');
		expect(
			formsMini.childAt(2).childAt(1).prop('id'),
			'forms-mini, max_fails input prop id'
		).to.be.equal('max_fails');
		expect(
			formsMini.childAt(2).childAt(1).prop('name'),
			'forms-mini, max_fails input prop name'
		).to.be.equal('max_fails');
		expect(
			formsMini.childAt(2).childAt(1).prop('className'),
			'forms-mini, max_fails input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(2).childAt(1).prop('onInput'),
			'forms-mini, max_fails input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(2).childAt(1).prop('onInput').name,
			'forms-mini, max_fails input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(2).childAt(1).prop('value'),
			'forms-mini, max_fails input prop value'
		).to.be.equal('max_fails_test');
		expect(
			formsMini.childAt(3).prop('className'),
			'forms-mini, fail_timeout group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(3).childAt(0).type(),
			'forms-mini, fail_timeout label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(3).childAt(0).prop('htmlFor'),
			'forms-mini, fail_timeout label htmlFor'
		).to.be.equal('fail_timeout');
		expect(
			formsMini.childAt(3).childAt(1).name(),
			'forms-mini, fail_timeout input'
		).to.be.equal('NumberInput');
		expect(
			formsMini.childAt(3).childAt(1).prop('id'),
			'forms-mini, fail_timeout input prop id'
		).to.be.equal('fail_timeout');
		expect(
			formsMini.childAt(3).childAt(1).prop('name'),
			'forms-mini, fail_timeout input prop name'
		).to.be.equal('fail_timeout');
		expect(
			formsMini.childAt(3).childAt(1).prop('className'),
			'forms-mini, fail_timeout input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(3).childAt(1).prop('onInput'),
			'forms-mini, fail_timeout input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(3).childAt(1).prop('onInput').name,
			'forms-mini, fail_timeout input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(3).childAt(1).prop('value'),
			'forms-mini, fail_timeout input prop value'
		).to.be.equal('fail_timeout_test');
		expect(
			formsMini.childAt(4).prop('className'),
			'forms-mini, slow_start group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(4).childAt(0).type(),
			'forms-mini, slow_start label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(4).childAt(0).prop('htmlFor'),
			'forms-mini, slow_start label htmlFor'
		).to.be.equal('slow_start');
		expect(
			formsMini.childAt(4).childAt(1).name(),
			'forms-mini, slow_start input'
		).to.be.equal('NumberInput');
		expect(
			formsMini.childAt(4).childAt(1).prop('id'),
			'forms-mini, slow_start input prop id'
		).to.be.equal('slow_start');
		expect(
			formsMini.childAt(4).childAt(1).prop('name'),
			'forms-mini, slow_start input prop name'
		).to.be.equal('slow_start');
		expect(
			formsMini.childAt(4).childAt(1).prop('className'),
			'forms-mini, slow_start input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(4).childAt(1).prop('onInput'),
			'forms-mini, slow_start input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(4).childAt(1).prop('onInput').name,
			'forms-mini, slow_start input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(4).childAt(1).prop('value'),
			'forms-mini, slow_start input prop value'
		).to.be.equal('slow_start_test');
		expect(
			formsMini.childAt(5).prop('className'),
			'forms-mini, service group className'
		).to.be.equal(styles['form-group']);
		expect(
			formsMini.childAt(5).childAt(0).type(),
			'forms-mini, service label'
		).to.be.equal('label');
		expect(
			formsMini.childAt(5).childAt(0).prop('htmlFor'),
			'forms-mini, service label htmlFor'
		).to.be.equal('service');
		expect(
			formsMini.childAt(5).childAt(1).type(),
			'forms-mini, service input'
		).to.be.equal('input');
		expect(
			formsMini.childAt(5).childAt(1).prop('id'),
			'forms-mini, service input prop id'
		).to.be.equal('service');
		expect(
			formsMini.childAt(5).childAt(1).prop('name'),
			'forms-mini, service input prop name'
		).to.be.equal('service');
		expect(
			formsMini.childAt(5).childAt(1).prop('className'),
			'forms-mini, service input prop className'
		).to.be.equal(styles['input']);
		expect(
			formsMini.childAt(5).childAt(1).prop('onInput'),
			'forms-mini, service input prop onInput'
		).to.be.a('function');
		expect(
			formsMini.childAt(5).childAt(1).prop('onInput').name,
			'forms-mini, service input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			formsMini.childAt(5).childAt(1).prop('value'),
			'forms-mini, service input prop value'
		).to.be.equal('service_test');

		let radio = content.childAt(2);

		expect(radio.prop('className'), 'radio group className').to.be.equal(styles['radio']);
		expect(radio.children(), '[isStream] radio group children count').to.have.lengthOf(3);
		expect(
			radio.childAt(0).prop('className'),
			'radio, title className'
		).to.be.equal(styles['title']);
		expect(radio.childAt(1).type(), 'radio, state up label').to.be.equal('label');
		expect(
			radio.childAt(1).childAt(0).type(),
			'radio, state up input'
		).to.be.equal('input');
		expect(
			radio.childAt(1).childAt(0).prop('name'),
			'radio, state up input, prop name'
		).to.be.equal('state');
		expect(
			radio.childAt(1).childAt(0).prop('value'),
			'radio, state up input, prop value'
		).to.be.equal('false');
		expect(
			radio.childAt(1).childAt(0).prop('type'),
			'radio, state up input, prop type'
		).to.be.equal('radio');
		expect(
			radio.childAt(1).childAt(0).prop('onChange'),
			'radio, state up input, prop onChange'
		).to.be.a('function');
		expect(
			radio.childAt(1).childAt(0).prop('onChange').name,
			'radio, state up input, prop onChange name'
		).to.be.equal('bound handleRadioChange');
		expect(
			radio.childAt(1).childAt(0).prop('checked'),
			'radio, state up input, prop checked'
		).to.be.false;
		expect(
			radio.childAt(2).childAt(0).type(),
			'radio, state down input'
		).to.be.equal('input');
		expect(
			radio.childAt(2).childAt(0).prop('name'),
			'radio, state down input, prop name'
		).to.be.equal('state');
		expect(
			radio.childAt(2).childAt(0).prop('value'),
			'radio, state down input, prop value'
		).to.be.equal('true');
		expect(
			radio.childAt(2).childAt(0).prop('type'),
			'radio, state down input, prop type'
		).to.be.equal('radio');
		expect(
			radio.childAt(2).childAt(0).prop('onChange'),
			'radio, state down input, prop onChange'
		).to.be.a('function');
		expect(
			radio.childAt(2).childAt(0).prop('onChange').name,
			'radio, state down input, prop onChange name'
		).to.be.equal('bound handleRadioChange');
		expect(
			radio.childAt(2).childAt(0).prop('checked'),
			'radio, state down input, prop checked'
		).to.be.true;

		let footer = wrapper.childAt(2).childAt(1);

		expect(footer.prop('className'), 'footer className').to.be.equal(styles['footer']);
		expect(footer.children(), '[isAdd = true] footer childs count').to.have.lengthOf(2);
		expect(
			footer.childAt(0).prop('className'),
			'footer, save className'
		).to.be.equal(styles['save']);
		expect(
			footer.childAt(0).prop('onClick'),
			'footer, save onClick'
		).to.be.a('function');
		expect(
			footer.childAt(0).prop('onClick').name,
			'footer, save onClick name'
		).to.be.equal('bound save');
		expect(
			footer.childAt(0).text(),
			'footer, save text'
		).to.be.equal('Add');
		expect(
			footer.childAt(1).prop('className'),
			'footer, cancel className'
		).to.be.equal(styles['cancel']);
		expect(
			footer.childAt(1).prop('onClick'),
			'footer, cancel onClick'
		).to.be.a('function');
		expect(
			footer.childAt(1).prop('onClick').name,
			'footer, cancel onClick name'
		).to.be.equal('bound close');

		wrapper.setProps({ isStream: false });
		data.host = 'host_test';
		wrapper.setState({
			data,
			addAsDomain: true
		});

		content = wrapper.childAt(2).childAt(0);
		serversGroup = content.childAt(0);

		expect(
			serversGroup.children(),
			'[with data.host, isStream = false, isAdd] serves group elements count'
		).to.have.lengthOf(4);
		expect(
			serversGroup.childAt(0).childAt(1).prop('disabled'),
			'[with data.host] server address, input prop disabled'
		).to.be.true;
		expect(
			serversGroup.childAt(1).prop('className'),
			'domain name className'
		).to.be.equal(styles['form-group']);
		expect(
			serversGroup.childAt(1).text(),
			'domain name text'
		).to.be.equal('Domain name: host_test');
		expect(
			serversGroup.childAt(2).prop('className'),
			'server route className'
		).to.be.equal(styles['form-group']);
		expect(
			serversGroup.childAt(2).childAt(0).type(),
			'server route, label html tag'
		).to.be.equal('label');
		expect(
			serversGroup.childAt(2).childAt(0).prop('htmlFor'),
			'server route, label htmlFor'
		).to.be.equal('route');
		expect(
			serversGroup.childAt(2).childAt(1).type(),
			'server route, input html tag'
		).to.be.equal('input');
		expect(
			serversGroup.childAt(2).childAt(1).prop('id'),
			'server route, input prop id'
		).to.be.equal('route');
		expect(
			serversGroup.childAt(2).childAt(1).prop('name'),
			'server route, input prop name'
		).to.be.equal('route');
		expect(
			serversGroup.childAt(2).childAt(1).prop('className'),
			'server route, input prop className'
		).to.be.equal(styles['input']);
		expect(
			serversGroup.childAt(2).childAt(1).prop('type'),
			'server route, input prop type'
		).to.be.equal('text');
		expect(
			serversGroup.childAt(2).childAt(1).prop('value'),
			'server route, input prop value'
		).to.be.equal('route_test');
		expect(
			serversGroup.childAt(2).childAt(1).prop('onInput'),
			'server route, input prop onInput'
		).to.be.a('function');
		expect(
			serversGroup.childAt(2).childAt(1).prop('onInput').name,
			'server route, input prop onInput name'
		).to.be.equal('bound handleFormChange');
		expect(
			serversGroup.childAt(2).childAt(1).prop('maxLength'),
			'server route, input prop maxLength'
		).to.be.equal(32);

		formsMini = content.childAt(1);

		expect(
			formsMini.children(),
			'[isAdd, state.addAsDomain] forms-mini children count'
		).to.have.lengthOf(5);

		radio = content.childAt(2);

		expect(
			radio.children(),
			'[isStream = false] radio group children count'
		).to.have.lengthOf(4);
		expect(
			radio.childAt(3).childAt(0).type(),
			'radio, state down input'
		).to.be.equal('input');
		expect(
			radio.childAt(3).childAt(0).prop('name'),
			'radio, state down input, prop name'
		).to.be.equal('state');
		expect(
			radio.childAt(3).childAt(0).prop('id'),
			'radio, state down input, prop id'
		).to.be.equal('drain');
		expect(
			radio.childAt(3).childAt(0).prop('value'),
			'radio, state down input, prop value'
		).to.be.equal('true');
		expect(
			radio.childAt(3).childAt(0).prop('type'),
			'radio, state down input, prop type'
		).to.be.equal('radio');
		expect(
			radio.childAt(3).childAt(0).prop('onChange'),
			'radio, state down input, prop onChange'
		).to.be.a('function');
		expect(
			radio.childAt(3).childAt(0).prop('onChange').name,
			'radio, state down input, prop onChange name'
		).to.be.equal('bound handleRadioChange');
		expect(
			radio.childAt(3).childAt(0).prop('checked'),
			'radio, state down input, prop checked'
		).to.be.true;

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

		expect(
			wrapper.childAt(0).childAt(0).text(),
			'[peers.length = 1] title text'
		).to.be.equal('Edit server test_server_1 "upstream_test"');

		content = wrapper.childAt(2).childAt(0);

		expect(
			content.children(),
			'[with errorMessages] content children count'
		).to.have.lengthOf(4);

		serversGroup = content.childAt(0);

		expect(
			serversGroup.prop('className'),
			'[isAdd = false, peers.size = 1] server groups className'
		).to.be.an('undefined');
		expect(
			serversGroup.children(),
			'[with data.host, isStream = false, isAdd = false] serves group elements count'
		).to.have.lengthOf(3);
		expect(
			formsMini.children(),
			'[isAdd = false, state.addAsDomain] forms-mini children count'
		).to.have.lengthOf(5);
		expect(
			content.childAt(3).prop('className'),
			'error messages className'
		).to.be.equal(styles['error']);
		expect(
			content.childAt(3).childAt(0).prop('className'),
			'error messages, close className'
		).to.be.equal(styles['error-close']);
		expect(
			content.childAt(3).childAt(0).prop('onClick'),
			'error messages, close onClick'
		).to.be.a('function');
		expect(
			content.childAt(3).childAt(0).prop('onClick').name,
			'error messages, close onClick name'
		).to.be.equal('bound closeErrors');
		expect(
			content.childAt(3).childAt(1).text(),
			'error messages, error 1'
		).to.be.equal('error_1');
		expect(
			content.childAt(3).childAt(2).text(),
			'error messages, error 2'
		).to.be.equal('error_2');

		footer = wrapper.childAt(2).childAt(1);

		expect(footer.children(), '[isAdd = false] footer childs count').to.have.lengthOf(3);
		expect(
			footer.childAt(0).prop('className'),
			'footer, remove className'
		).to.be.equal(styles['remove']);
		expect(
			footer.childAt(0).prop('onClick'),
			'footer, remove onClick'
		).to.be.a('function');
		expect(
			footer.childAt(0).prop('onClick').name,
			'footer, remove onClick name'
		).to.be.equal('bound remove');
		expect(
			footer.childAt(1).text(),
			'footer, save text'
		).to.be.equal('Save');

		wrapper.setProps({ peers: new Map([
			['test_1', {
				id: 'test_1',
				server: 'test_server_1'
			}], ['test_2', {
				id: 'test_2',
				server: 'test_server_2'
			}]
		]) });

		expect(
			wrapper.childAt(0).childAt(0).text(),
			'[peers.length = 1] title text'
		).to.be.equal('Edit servers "upstream_test"');

		content = wrapper.childAt(2).childAt(0);
		serversGroup = content.childAt(0);

		expect(
			serversGroup.prop('className'),
			'[isAdd = false, peers.size = 2] server groups className'
		).to.be.equal(styles['form-group']);
		expect(
			serversGroup.childAt(0).type(),
			'servers list, child 1'
		).to.be.equal('label');
		expect(
			serversGroup.childAt(1).type(),
			'servers list, child 2'
		).to.be.equal('ul');
		expect(
			serversGroup.childAt(1).prop('className'),
			'servers list, child 2 className'
		).to.be.equal(styles['servers-list']);
		expect(
			serversGroup.childAt(1).children(),
			'servers list, child 2, childs size'
		).to.have.lengthOf(2);
		expect(
			serversGroup.childAt(1).childAt(0).type(),
			'servers list, child 2, child 1'
		).to.be.equal('li');
		expect(
			serversGroup.childAt(1).childAt(0).text(),
			'servers list, child 2, child 1 text'
		).to.be.equal('test_server_1');
		expect(
			serversGroup.childAt(1).childAt(1).type(),
			'servers list, child 2, child 2'
		).to.be.equal('li');
		expect(
			serversGroup.childAt(1).childAt(1).text(),
			'servers list, child 2, child 2 text'
		).to.be.equal('test_server_2');

		wrapper.setState({ loading: true });

		content = wrapper.childAt(2);

		expect(
			content.prop('className'),
			'[state.loading = true] content className'
		).to.be.equal(styles['content']);
		expect(content.childAt(0).name(), 'Loader').to.be.equal('Loader');
		expect(
			content.childAt(0).prop('className'),
			'Loader className'
		).to.be.equal(styles['loader']);
		expect(
			content.childAt(0).prop('gray'),
			'Loader prop gray'
		).to.be.true;

		wrapper.setState({
			loading: false,
			success: true,
			successMessage: 'success message test'
		});

		content = wrapper.childAt(2).childAt(0);

		expect(
			content.prop('className'),
			'[state.success = true] content className'
		).to.be.equal(styles['content']);
		expect(
			content.text(),
			'[state.success = true] content text'
		).to.be.equal('success message test');

		footer = wrapper.childAt(2).childAt(1);

		expect(
			footer.prop('className'),
			'[state.success = true] footer'
		).to.be.equal(styles['footer']);
		expect(
			footer.childAt(0).prop('className'),
			'[state.success = true] footer, save className'
		).to.be.equal(styles['save']);
		expect(
			footer.childAt(0).prop('onClick'),
			'[state.success = true] footer, save onClick'
		).to.be.a('function');
		expect(
			footer.childAt(0).prop('onClick').name,
			'[state.success = true] footer, save onClick'
		).to.be.equal('bound close');

		wrapper.unmount();
	});
});
