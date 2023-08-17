import { getServerName } from '../utils';

describe('UpstreamsApi - Utils', () => {
  it('getServerName()', () => {
    expect(() => getServerName()).to.throw(/required/);
    expect(() => getServerName({})).to.throw(/required/);
    expect(() => getServerName({ server: null })).to.throw(/required/);
    expect(() => getServerName({ server: undefined })).to.throw(/required/);
    expect(() => getServerName({ server: '', service: '' })).to.throw(/required/);
    expect(getServerName({ server: '10.0.0.0:80' })).to.be.string('10.0.0.0:80');
    expect(getServerName({ server: '10.0.0.0:80', service: undefined })).to.be.string('10.0.0.0:80');
    expect(getServerName({ server: '10.0.0.0:80', service: null })).to.be.string('10.0.0.0:80');
    expect(getServerName({ server: '10.0.0.0:80', service: '' })).to.be.string('10.0.0.0:80');
    expect(getServerName({ server: '10.0.0.0:80', service: '_http._tcp' })).to.be.string('_http._tcp@10.0.0.0:80');
  })
})
