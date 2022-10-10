/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { spy, stub } from 'sinon';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import tableUtils from '../utils.jsx';

describe('Table utils', () => {
	it('responsesTextWithTooltip()', () => {
		spy(utils, 'getHTTPCodesArray');
		const tooltipRowsContentResult = 'tooltipRowsContentResult';
		stub(tableUtils, 'tooltipRowsContent').callsFake(() => tooltipRowsContentResult);

		const textResult = 'textResult';
		const codes = {
			'101': 10,
			'200': 320,
			'303': 0,
			'404': 1,
			'500': 103,
		};
		const codeGroup = '1';

		expect(tableUtils.responsesTextWithTooltip(textResult, codes, codeGroup), '').to.be.equal(
			tooltipRowsContentResult
		);
		expect(utils.getHTTPCodesArray.calledOnce, 'getHTTPCodesArray called').to.be.true;
		expect(utils.getHTTPCodesArray.args[0][0], 'getHTTPCodesArray, arg 1').to.be.deep.equal(
			codes
		);
		expect(utils.getHTTPCodesArray.args[0][1], 'getHTTPCodesArray, arg 2').to.be.equal(
			codeGroup
		);
		expect(tableUtils.tooltipRowsContent.calledOnce, 'tooltipRowsContent called').to.be.true;
		expect(tableUtils.tooltipRowsContent.args[0][0], 'tooltipRowsContent arg 1').to.be.equal(textResult);
		expect(tableUtils.tooltipRowsContent.args[0][1], 'tooltipRowsContent arg 2').to.be.deep.equal(
			[{
				id: '101',
				label: '101',
				value: 10,
			}]
		);
		expect(tableUtils.tooltipRowsContent.args[0][2], 'tooltipRowsContent arg 3').to.be.equal('hint');

		utils.getHTTPCodesArray.restore();
		tableUtils.tooltipRowsContent.restore();
	});

	describe('tooltipRowsContent()', () => {
		const textResult = 'textResult';
		const items = [
			{
				id: 'item_1',
				label: 'A',
				value: 123,
			}
		];
		const useTooltipResult = 'useTooltipResult';

		before(() => {
			stub(tooltips, 'useTooltip').callsFake(() => ({ useTooltipResult }));
		});

		afterEach(() => {
			tooltips.useTooltip.resetHistory();
		});

		after(() => {
			tooltips.useTooltip.restore();
		});

		it('No items', () => {
			expect(tableUtils.tooltipRowsContent(textResult)).to.be.equal(textResult);
			expect(tooltips.useTooltip.callCount, 'useTooltip was not called').to.be.equal(0);
		});

		it('With items', () => {
			const position = 'test position';
			const result = tableUtils.tooltipRowsContent(textResult, items, position);

			expect(result.props.children, 'result text').to.be.equal(textResult);
			expect(result.props.useTooltipResult, 'tooltip props were extracted').to.be.equal(useTooltipResult);

			expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
			const tooltipContent = tooltips.useTooltip.args[0][0].props.children;
			expect(tooltipContent[0].key, 'tooltip content, key').to.be.equal(items[0].id);
			expect(tooltipContent[0].props.children[0].props.children.join(''), 'tooltip content, label').to.be.equal('A:');
			expect(tooltipContent[0].props.children[2].props.children, 'tooltip content, value').to.be.equal(123);
			expect(tooltips.useTooltip.args[0][1], 'tooltip position').to.be.equal(position);
		});
	});
});
