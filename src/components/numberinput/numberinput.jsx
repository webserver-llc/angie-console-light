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

export default class NumberInput extends React.Component {
	static onKeyPress(evt) {
		if (evt.charCode !== 0 && !isFinite(String.fromCharCode(evt.charCode))) {
			evt.preventDefault();
		}
	}

	render() {
		return <input type="text" onKeyPress={NumberInput.onKeyPress} {...this.props} />;
	}
}
