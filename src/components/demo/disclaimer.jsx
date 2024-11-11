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
import styles from './style.css';

export default class Disclaimer extends React.Component {
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
		if (this.state.opened === false) {
			return null;
		}

		return (
			<div className={styles.disclaimer}>
				<div className={styles['disclaimer-close']} onClick={this.close}>x</div>
				<div className={styles['disclaimer-content']}>
					Здесь приведен пример работы Angie Console Light. Эта страница собирает реальные данные из демо-версии веб-сервера Angie.
					<br />
					Узнать подробнее о настройке Angie Console Light можно на нашем сайте:
					{' '}
					<a href="https://angie.software/angie/docs/configuration/monitoring/">https://angie.software/angie/docs/configuration/monitoring/</a>
					<br />
					Для покупки Angie Pro свяжитесь с нами:
					{' '}
					<a href="https://angie.software/angie/pro/">https://angie.software/angie/pro/</a>
				</div>
			</div>
		);
	}
}
