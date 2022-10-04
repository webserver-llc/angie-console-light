/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

import React from 'react';
import { shallow } from 'enzyme';
import { spy, stub } from 'sinon';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import { responsesTextWithTooltip } from '../utils.jsx';

describe('Table utils', () => {
	describe('responsesTextWithTooltip()', () => {
		const textResult = 'textResult';
		const codes = {
			'101': 10,
			'102': 7,
			'200': 320,
		};
		const codeGroup = '1';
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

		it('Empty codes', () => {
			expect(responsesTextWithTooltip(textResult, {}, codeGroup)).to.be.equal(textResult);
			expect(tooltips.useTooltip.callCount, 'useTooltip was not called').to.be.equal(0);
		});

		it('With codes', () => {
			const result = responsesTextWithTooltip(textResult, codes, codeGroup);

			expect(result.props.children, 'result text').to.be.equal(textResult);
			expect(result.props.useTooltipResult, 'tooltip props were extracted').to.be.equal(useTooltipResult);

			expect(tooltips.useTooltip.calledOnce, 'useTooltip called once').to.be.true;
			const tooltipContent = tooltips.useTooltip.args[0][0].props.children;
			expect(tooltipContent, 'tooltip content length').to.have.lengthOf(2);
			expect(tooltipContent[0].props.children[0], 'tooltip content row 1, key').to.be.equal('101');
			expect(tooltipContent[0].props.children[2], 'tooltip content row 1, value').to.be.equal(10);
			expect(tooltipContent[1].props.children[0], 'tooltip content row 1, key').to.be.equal('102');
			expect(tooltipContent[1].props.children[2], 'tooltip content row 1, value').to.be.equal(7);
		});
	});
});