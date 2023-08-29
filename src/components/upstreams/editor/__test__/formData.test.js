import { formData } from '../formData';

describe('formData()', () => {
  it('with strings values', () => {
    const data = formData();
    data.weight = '1';
    data.max_conns = '2';
    data.max_fails = '3';
    data.fail_timeout = '4';
    data.test = 'name';
    data.server = 'name';
    expect(JSON.stringify(data)).to.be.equal(
      '{"weight":1,"max_conns":2,"max_fails":3,"fail_timeout":4,"test":"name"}',
    );
  });

  it('with null values', () => {
    const data = formData();
    data.weight = null;
    data.max_conns = '2';
    data.max_fails = '3';
    data.fail_timeout = '4';
    data.test = 'name';
    data.server = 'name';
    expect(JSON.stringify(data)).to.be.equal(
      '{"weight":null,"max_conns":2,"max_fails":3,"fail_timeout":4,"test":"name"}',
    );
  });
});
