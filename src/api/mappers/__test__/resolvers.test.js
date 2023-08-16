import mapperResolvers from '../resolvers';

describe("Mapper - Resolvers", () => {
  it("mapperResolvers", () => {
    const angieResolvers = {
      "resolver-http": {
        queries: {
          name: 442,
          srv: 2,
          addr: 3,
        },
        responses: {
          success: 440,
          timedout: 1,
          format_error: 2,
          server_failure: 3,
          not_found: 4,
          unimplemented: 5,
          refused: 6,
          other: 7,
        },
      },
    };
    const nginxResolvers = {
      "resolver-http": {
        requests: {
          name: 442,
          srv: 2,
          addr: 3,
        },
        responses: {
          noerror: 440,
          timedout: 1,
          formerr: 2,
          servfail: 3,
          nxdomain: 4,
          notimp: 5,
          refused: 6,
          unknown: 7,
        },
      },
    }
    expect(mapperResolvers({}), "should be empty object").to.be.an("object")
      .that.is.empty;
    expect(
      mapperResolvers(angieResolvers),
      "should be correct format",
    ).to.be.deep.equal(nginxResolvers);
  });
});
