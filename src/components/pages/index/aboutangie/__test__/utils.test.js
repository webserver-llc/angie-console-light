import { getHrefDocs } from "../utils"

describe('AboutAngie Utils', () => {
  it('getHrefDocs()', () => {
    expect(getHrefDocs('PRO'), 'link to angie pro docs').to.be.string('https://wbsrv.ru/angie-pro/docs/')
    expect(getHrefDocs('pro'), 'link to angie pro docs').to.be.string('https://wbsrv.ru/angie-pro/docs/')
    expect(getHrefDocs('PRO p1'), 'link to angie pro docs').to.be.string('https://wbsrv.ru/angie-pro/docs/')
    expect(getHrefDocs(), 'link to angie docs').to.be.string('https://angie.software/en/')
    expect(getHrefDocs(''), 'link to angie docs').to.be.string('https://angie.software/en/')
    expect(getHrefDocs('oss'), 'link to angie docs').to.be.string('https://angie.software/en/')
    expect(getHrefDocs(null), 'link to angie docs').to.be.string('https://angie.software/en/')
  })
})
