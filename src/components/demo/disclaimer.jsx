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
import { withNamespaces } from 'react-i18next';
import styles from './style.css';

const Docs = {
	ru: 'https://angie.software/angie/docs/configuration/monitoring/',
	en: 'https://angie.software/en/console/',
};

class Disclaimer extends React.Component {
	constructor() {
		super();
		this.state = {
			opened: true
		};

		this.close = this.close.bind(this);
	}

	close() {
		this.setState({
			opened: false
		});
	}

	render() {
		const { t, i18n } = this.props;

		if (this.state.opened === false) {
			return null;
		}

		return (
			<div className={styles.disclaimer}>
				<div className={styles['disclaimer-close']} onClick={this.close}>x</div>
				<div className={styles['disclaimer-content']}>
					{t('Below is the example of the Angie Console Light. This page collects real time data from a demo instance of Angie.')}
					<br />
					{t('For more information on configuration please visit')}
					{' '}
					<a href={Docs[i18n.language]}>{Docs[i18n.language]}</a>
					<br />
					{t('For purchasing Angie Pro please contact the sales team:')}
					{' '}
					<a href="https://angie.software/angie/pro/">https://angie.software/angie/pro/</a>
				</div>
			</div>
		);
	}
}

export default withNamespaces('demo')(Disclaimer);
