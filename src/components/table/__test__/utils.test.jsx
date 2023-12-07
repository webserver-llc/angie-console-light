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

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import tableUtils from '../utils.jsx';

describe('Table utils', () => {
	it('responsesTextWithTooltip()', () => {
		jest.spyOn(utils, 'getHTTPCodesArray').mockClear();
		const tooltipRowsContentResult = 'tooltipRowsContentResult';
		jest.spyOn(tableUtils, 'tooltipRowsContent').mockClear().mockImplementation(() => tooltipRowsContentResult);

		const textResult = 'textResult';
		const codes = {
			101: 10,
			200: 320,
			303: 0,
			404: 1,
			500: 103,
		};
		const codeGroup = '1';

		//
		expect(tableUtils.responsesTextWithTooltip(textResult, codes, codeGroup)).toBe(tooltipRowsContentResult);
		// getHTTPCodesArray called
		expect(utils.getHTTPCodesArray).toHaveBeenCalledTimes(1);
		// getHTTPCodesArray, arg 1
		expect(utils.getHTTPCodesArray.mock.calls[0][0]).toEqual(codes);
		// getHTTPCodesArray, arg 2
		expect(utils.getHTTPCodesArray.mock.calls[0][1]).toBe(codeGroup);
		// tooltipRowsContent called
		expect(tableUtils.tooltipRowsContent).toHaveBeenCalledTimes(1);
		// tooltipRowsContent arg 1
		expect(tableUtils.tooltipRowsContent.mock.calls[0][0]).toBe(textResult);
		// tooltipRowsContent arg 2
		expect(tableUtils.tooltipRowsContent.mock.calls[0][1]).toEqual([{
			id: '101',
			label: '101',
			value: 10,
		}]);
		// tooltipRowsContent arg 3
		expect(tableUtils.tooltipRowsContent.mock.calls[0][2]).toBe('hint');

		utils.getHTTPCodesArray.mockRestore();
		tableUtils.tooltipRowsContent.mockRestore();
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

		beforeAll(() => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({ useTooltipResult }));
		});

		afterEach(() => {
			tooltips.useTooltip.mockClear();
		});

		afterAll(() => {
			tooltips.useTooltip.mockRestore();
		});

		it('No items', () => {
			expect(tableUtils.tooltipRowsContent(textResult)).toBe(textResult);
			expect(tooltips.useTooltip).toHaveBeenCalledTimes(0);
		});

		it('With items', () => {
			const position = 'test position';
			const result = tableUtils.tooltipRowsContent(textResult, items, position);

			// result text
			expect(result.props.children).toBe(textResult);
			// tooltip props were extracted
			expect(result.props.useTooltipResult).toBe(useTooltipResult);

			// useTooltip called once
			expect(tooltips.useTooltip).toHaveBeenCalledTimes(1);
			const tooltipContent = tooltips.useTooltip.mock.calls[0][0].props.children;
			// tooltip content, key
			expect(tooltipContent[0].key).toBe(items[0].id);
			// tooltip content, label
			expect(tooltipContent[0].props.children[0].props.children.join('')).toBe('A:');
			// tooltip content, value
			expect(tooltipContent[0].props.children[2].props.children).toBe(123);
			// tooltip position
			expect(tooltips.useTooltip.mock.calls[0][1]).toBe(position);
		});
	});
});
