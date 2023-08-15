import mapperHttpUpstreams from "../httpUpstreams";

describe("Mappers - HTTP Upstreams", () => {
  it("mapperHttpUpstreams", () => {
    const angieHttpUpstreams = {
      "upsteam-red": {
        peers: {
          "10.11.128.1:80": {
            server: "10.11.128.1",
            backup: false,
            weight: 1,
            state: "up",
            selected: {
              current: 0,
              total: 0,
            },
            responses: {
              200: 198,
              301: 6,
              302: 1,
              400: 1,
              403: 1,
              404: 2,
              501: 4,
              502: 2,
              503: 3,
              504: 4,
            },
            data: {
              sent: 128,
              received: 256,
            },
            health: {
              fails: 0,
              unavailable: 0,
              downtime: 0,
            },
            sid: "8c7de8e7900b468ba646cb8a9e8a588b",
            refs: 0,
          },
        },
        keepalive: 0,
        zombies: 0,
        zone: "upstream-red",
      },
    };
    const nginxHttpUpsreams = {
      "upsteam-red": {
        peers: [
          {
            server: "10.11.128.1",
            name: "10.11.128.1:80",
            backup: false,
            weight: 1,
            state: "up",
            selected: {
              current: 0,
              total: 0,
            },
            responses: {
              "1xx": 0,
              "2xx": 198,
              "3xx": 7,
              "4xx": 4,
              "5xx": 13,
              codes: {
                200: 198,
                301: 6,
                302: 1,
                400: 1,
                403: 1,
                404: 2,
                501: 4,
                502: 2,
                503: 3,
                504: 4,
              },
              total: 222,
            },
            data: {
              sent: 128,
              received: 256,
            },
            health: {
              fails: 0,
              unavailable: 0,
              downtime: 0,
            },
            sid: "8c7de8e7900b468ba646cb8a9e8a588b",
            refs: 0,
          },
        ],
        keepalive: 0,
        zombies: 0,
        zone: "upstream-red",
      },
    };
    expect(mapperHttpUpstreams({}), "should be empty object").to.be.an("object")
      .that.is.empty;
    expect(
      mapperHttpUpstreams(angieHttpUpstreams),
      "should be correct format",
    ).to.be.deep.equal(nginxHttpUpsreams);
  });
});
