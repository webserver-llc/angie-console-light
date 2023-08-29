/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
/* eslint max-len: 0 */
/* eslint no-useless-escape: 0 */
/* eslint no-throw-literal: 0 */

import React from 'react';
import Popup from '../../popup/popup.jsx';
import Loader from '../../loader/loader.jsx';
import NumberInput from '../../numberinput/numberinput.jsx';
import styles from './style.css';
import utils from './formData.js';
import { isIP } from '../../../utils.js';

const RGX_SERVICE_SETTING = /^[\w-.]+$/;
const RGX_SERVER_ADDRESS =
	/^([\w-]|(\.(?!\.+)))[\w-.]*\:(\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
const RGX_HTTP_SERVER_ADDRESS =
	/^([\w-]|(\.(?!\.+)))[\w-.]*(\:(\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/;

export default class UpstreamsEditor extends React.Component {
	static normalizeInputData(data) {
		// Remove "s" ending
		Object.keys(data).forEach((key) => {
			if (key === 'fail_timeout' || key === 'slow_start') {
				data[key] = parseInt(data[key], 10);
			}
		});

		return data;
	}

	static normalizeOutputData(data, initialData) {
		data = utils.formData({ ...data });

		if (data.server === initialData.server) {
			delete data.server;
		}

		delete data.id;

		/* If edit peer from DNS */
		if ('parent' in data) {
			delete data.parent;
			delete data.host;
			delete data.server;
		}

		return data;
	}

	constructor(props) {
		super();

		this.state = {
			success: false,
			loading: false,
			shouldClearPeers: false,
			errorMessages: null,
		};

		if (!props.peers || props.peers.size > 1) {
			this.state.data = utils.formData();
			this.state.initialData = {};
		} else if (props.peers && props.peers.size === 1) {
			this.state.loading = true;

			props.upstreamsApi
				.getPeer(props.upstream.name, Array.from(props.peers)[0][1])
				.then((data) => {
					const normalizedData = UpstreamsEditor.normalizeInputData(
						utils.formData(data),
					);

					this.setState({
						data: normalizedData,
						initialData: { ...normalizedData },
						loading: false,
					});
				});
		}

		this.validateServerName = this.validateServerName.bind(this);

		this.handleFormChange = this.handleFormChange.bind(this);
		this.handleRadioChange = this.handleRadioChange.bind(this);

		this.validate = this.validate.bind(this);
		this.save = this.save.bind(this);
		this.close = this.close.bind(this);
		this.remove = this.remove.bind(this);

		this.closeErrors = this.closeErrors.bind(this);
	}

	handleFormChange({ target }) {
		const { data } = this.state;

		let value;

		if (target.type === 'checkbox') {
			value = target.checked;
		} else {
			value = target.value;
		}

		data[target.name] = value;

		this.setState({
			data,
		});
	}

	handleRadioChange({ target }) {
		const { data } = this.state;

		if (target.id === 'drain') {
			delete data.down;
			data.drain = true;
		} else {
			delete data.drain;
			data.down = target.value === 'true';
		}

		this.setState({
			data,
		});
	}

	save() {
		const { upstreamsApi, peers } = this.props;
		const isAdd = !peers;
		this.closeErrors();

		this.setState({
			loading: true,
		});

		this.validate(this.state.data)
			.then(() => {
				if (isAdd) {
					return upstreamsApi
						.createPeer(this.props.upstream.name, this.state.data)
						.then(() => {
							this.setState({
								success: true,
								successMessage: 'Server added successfully',
							});
						});
				}

				return Promise.all(
					Array.from(peers).map(([peerId, peer]) =>
						upstreamsApi.updatePeer(
							this.props.upstream.name,
							peer,
							UpstreamsEditor.normalizeOutputData(
								this.state.data,
								this.state.initialData,
							),
						),
					),
				).then(() => {
					this.setState({
						success: true,
						successMessage: 'Changes saved',
					});
				});
			})
			.then(() => {
				this.setState({
					loading: false,
				});
			})
			.catch((data) => {
				let errorMessages;

				if (data instanceof Array) {
					errorMessages = data;
				} else {
					errorMessages = [data.error];
				}

				this.showErrors(errorMessages);
			});
	}

	closeErrors() {
		this.setState({
			errorMessages: null,
		});
	}

	showErrors(errorMessages) {
		this.setState({
			errorMessages,
			loading: false,
		});
	}

	close() {
		this.props.onClose(this.state.shouldClearPeers);
	}

	remove() {
		const peersArray = Array.from(this.props.peers);

		Promise.all(
			peersArray.map(([peerId, peer]) =>
				this.props.upstreamsApi
					.deletePeer(this.props.upstream.name, peer)
					.then(() => peer.server),
			),
		)
			.then((servers) => {
				this.setState({
					success: true,
					shouldClearPeers: true,
					successMessage: `Servers ${servers.join(', ')} successfully removed`,
				});
			})
			.catch(({ error }) => this.showErrors([error]));
	}

	validate(data) {
		let valid = true;

		const addressRegexp = this.props.isStream
			? RGX_SERVER_ADDRESS
			: RGX_HTTP_SERVER_ADDRESS;
		const errorMessages = [];

		const multiplePeers = this.props.peers && this.props.peers.size > 1;
		const isAdd = !this.props.peers;

		if (!multiplePeers && isAdd && !data.server) {
			valid = false;
			errorMessages.push('Invalid server address or port');
		}

		if ('server' in data && !isIP(data.server)) {
			if (!addressRegexp.test(data.server) || data.server.length > 253) {
				valid = false;
				errorMessages.push('Invalid server address or port');
			} else if (
				data.service &&
				(!RGX_SERVICE_SETTING.test(data.service) ||
					data.server.length + data.service.length > 253)
			) {
				valid = false;
				errorMessages.push('Invalid server address or service setting');
			}
		}

		if (valid && multiplePeers) {
			const peersArray = Array.from(this.props.peers);

			return this.props.upstreamsApi
				.getPeer(this.props.upstream.name, peersArray[0][1])
				.then((data) => {
					if (data.error) {
						errorMessages.push(
							'No such server (please, check if it still exists)',
						);
						valid = false;
						return Promise.reject(errorMessages);
					}
				});
		}

		if (valid) {
			return Promise.resolve();
		}

		return Promise.reject(errorMessages);
	}

	validateServerName(evt) {
		const { value } = evt.target;

		this.setState({
			addAsDomain: !isIP(value),
		});
	}

	render() {
		const { upstream, peers, isStream } = this.props;

		let title = '';
		const isAdd = !peers || peers.size === 0;

		let peersArray;

		if (isAdd) {
			title = `Add server to "${upstream.name}"`;
		} else {
			peersArray = Array.from(peers);
			title = `Edit ${peers.size > 1 ? 'servers' : `server ${peersArray[0][1].server}`
			} "${upstream.name}"`;
		}

		let content = null;

		const { data = {} } = this.state;

		if (this.state.loading) {
			content = (
				<div className={styles.content}>
					<Loader className={styles.loader} gray />
				</div>
			);
		} else if (this.state.success) {
			content = (
				<div>
					<div className={styles.content}>{this.state.successMessage}</div>

					<div className={styles.footer}>
						<div className={styles.save} onClick={this.close}>
							Ok
						</div>
					</div>
				</div>
			);
		} else {
			content = (
				<div>
					<div className={styles.content}>
						{!isAdd && peersArray.length > 1 ? (
							<div className={styles['form-group']}>
								<label>Selected servers</label>

								<ul className={styles['servers-list']}>
									{peersArray.map(([peerId, peer]) => (
										<li key={peer.id}>{peer.server}</li>
									))}
								</ul>
							</div>
						) : (
							<div>
								{isAdd ? (
									<div className={styles['form-group']}>
										<label htmlFor="server">Server address</label>
										<input
											id="server"
											name="server"
											type="text"
											className={styles.input}
											value={data.server}
											placeholder="127.0.0.1:80"
											onKeyUp={this.validateServerName}
											onInput={this.handleFormChange}
											disabled={!!data.host}
										/>
									</div>
								) : null}

								{data.host ? (
									<div className={styles['form-group']}>
										<strong>Domain name:</strong>
										{' '}
										{data.host}
									</div>
								) : null}

								{isAdd ? (
									<div className={styles.checkbox}>
										<label>
											<input
												name="backup"
												type="checkbox"
												checked={data.backup}
												onChange={this.handleFormChange}
											/>
											Add as backup server
										</label>
									</div>
								) : null}
							</div>
						)}

						<div className={styles['forms-mini']}>
							<div className={styles['form-group']}>
								<label htmlFor="weight">weight</label>
								<NumberInput
									id="weight"
									name="weight"
									className={styles.input}
									onInput={this.handleFormChange}
									value={data.weight}
								/>
							</div>
							<div className={styles['form-group']}>
								<label htmlFor="max_conns">max_conns</label>
								<NumberInput
									className={styles.input}
									id="max_conns"
									name="max_conns"
									value={data.max_conns}
									onInput={this.handleFormChange}
								/>
							</div>
							<div className={styles['form-group']}>
								<label htmlFor="max_fails">max_fails</label>
								<NumberInput
									id="max_fails"
									name="max_fails"
									className={styles.input}
									value={data.max_fails}
									onInput={this.handleFormChange}
								/>
							</div>
							<div className={styles['form-group']}>
								<label htmlFor="fail_timeout">fail_timeout</label>
								<NumberInput
									id="fail_timeout"
									className={styles.input}
									name="fail_timeout"
									value={data.fail_timeout}
									onInput={this.handleFormChange}
								/>
							</div>
						</div>

						<div className={styles.radio}>
							<span className={styles.title}>Set state</span>

							<label>
								<input
									name="state"
									value="false"
									type="radio"
									onChange={this.handleRadioChange}
									checked={data.down === false}
								/>
								{' '}
								Up
							</label>

							<label>
								<input
									name="state"
									value="true"
									type="radio"
									onChange={this.handleRadioChange}
									checked={data.down === true}
								/>
								{' '}
								Down
							</label>
						</div>

						{this.state.errorMessages !== null ? (
							<div className={styles.error}>
								<span
									className={styles['error-close']}
									onClick={this.closeErrors}
								>
									×
								</span>
								{this.state.errorMessages.map((msg) => (
									<div>{msg}</div>
								))}
							</div>
						) : null}
					</div>

					<div className={styles.footer}>
						{!isAdd ? (
							<div className={styles.remove} onClick={this.remove}>
								Remove
							</div>
						) : null}

						<div className={styles.save} onClick={this.save}>
							{isAdd ? 'Add' : 'Save'}
						</div>

						<div className={styles.cancel} onClick={this.close}>
							Cancel
						</div>
					</div>
				</div>
			);
		}

		return (
			<Popup className={styles.editor}>
				<div className={styles.header}>{title}</div>
				<div className={styles.close} onClick={this.close}>
					×
				</div>

				{content}
			</Popup>
		);
	}
}
