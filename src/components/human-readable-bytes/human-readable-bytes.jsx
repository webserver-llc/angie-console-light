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
import utils from '#/utils';
import tooltips from '#/tooltips/index.jsx';

class HumanReadableBytes extends React.Component {
	formatReadableBytes(value, maxMeasurementUnit) {
		const { t } = this.props;
		return utils.formatReadableBytes(
			value,
			t(maxMeasurementUnit),
			utils.translateReadableBytesUnits({ t })
		);
	}

	render() {
		const { value = 0, measurementUnit, postfix = '' } = this.props;

		const readableValue = `${this.formatReadableBytes(value, measurementUnit)}${postfix}`;
		const bytesValue = `${this.formatReadableBytes(value, 'B')}${postfix}`;

		return (
			(value > 1023) ?
				(
					<span {...tooltips.useTooltip(bytesValue, 'hint')}>
						{readableValue}
					</span>
				) :
				(
					<span>{readableValue}</span>
				)
		);
	}
}

export default withNamespaces('common')(HumanReadableBytes);
