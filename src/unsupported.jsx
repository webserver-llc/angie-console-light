/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */

import React from 'react';
import Footer from './components/footer/footer.jsx';
import styles from './style.css';
import headerStyles from './components/header/style.css';

export default class Unsupported extends React.Component {
	render() {
		return (
			<div className={ styles.dashboard }>
				<div className={ headerStyles.header }>
					<div className={ headerStyles.logo }></div>
				</div>

				<div className={ styles.content }>
					<div className={ styles['error-block'] }>
						<p>Unfortunately your browser is not supported, please use modern one.</p>
						<p>For&nbsp;more information please refer to&nbsp;the&nbsp;following <a href="https://www.nginx.com/resources/admin-guide/monitoring/">documentation.</a></p>
					</div>
				</div>

				<Footer />
			</div>
		);
	}
}

export const start = () => {
	const fragment = document.createDocumentFragment();

	React.render(<Unsupported />, fragment);

	document.body.appendChild(fragment);
};
