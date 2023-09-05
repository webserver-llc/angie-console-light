import { stub } from "sinon";
import { apiUtils } from "../../../../../api";
import { docs, getHrefDocs } from "../utils"

describe('getHrefDocs()', () => {
  it('return link to oss docs', () => {
    expect(getHrefDocs()).to.be.equal(docs.default); 
  });
  
  it('return link to pro docs', () => {
    stub(apiUtils, 'isAngiePro').callsFake(() => true);
    expect(getHrefDocs()).to.be.equal(docs.pro);
    apiUtils.isAngiePro.restore();
  });
})
