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
import i18n from '../../i18n.js';
import styles from './language-control.css';

export default class LanguageControl extends React.Component {
	static changeLanguage(e) {
		i18n.changeLanguage(e.target.value);
	}

	render() {
		return (
			<select value={i18n.language} className={styles.select} onChange={LanguageControl.changeLanguage}>
				<option value="ru">Русский</option>
				<option value="en">English</option>
			</select>
		);
	}
}

