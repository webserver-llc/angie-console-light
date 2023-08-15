import mapperHttpResponse from '../httpResponse.js';

describe('Mappers - HTTP Response',() => {
	it('mapperHttpResponse()', () => {
		const angieHttpResponse = {
		  'russia': {
		    responses: {
			    200: 100660,	
			    405: 5,
			    406: 1,
		    } 
		  },
		}
		const nginxHttpResponse = {
		  'russia': {
		    responses: {
			    '1xx': 0,
			    '2xx': 100660,
			    '3xx': 0,
			    '4xx': 6,
			    '5xx': 0,
			    codes: {
				    200: 100660,	
				    405: 5,
				    406: 1,
			    },
			    total: 100666
		    } 
		  },
		}	
		expect(mapperHttpResponse({}), 'should be empty object').to.be.an('object').that.is.empty;
		expect(mapperHttpResponse(angieHttpResponse), 'should be correct format').to.be.deep.equal(nginxHttpResponse);
	})
})
