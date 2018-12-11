"use strict";

const path = require("path");
const npmConf = require("@lerna/npm-conf");
const { getPackages } = require("@lerna/project");
const initFixture = require("@lerna-test/init-fixture")(path.resolve(__dirname, "../../../integration"));

const packDirectory = require("..");

describe("pack-directory", () => {
  it("needs tests", async () => {
    const cwd = await initFixture("lerna-bootstrap");
    const conf = npmConf({ prefix: cwd });
    const pkgs = await getPackages(cwd);
    // choose first and last package since the middle two are repetitive
    const results = await Promise.all([pkgs.shift(), pkgs.pop()].map(pkg => packDirectory(pkg, conf)));

    /* eslint-disable max-len */
    expect(results).toMatchInlineSnapshot(`
Array [
  Object {
    "bundled": Array [],
    "entryCount": 3,
    "filename": "package-1/integration-package-1-1.0.0.tgz",
    "files": Array [
      Object {
        "mode": 420,
        "path": "package.json",
        "size": 269,
      },
      Object {
        "mode": 420,
        "path": "build.js",
        "size": 329,
      },
      Object {
        "mode": 420,
        "path": "index.src.js",
        "size": 141,
      },
    ],
    "id": "@integration/package-1@1.0.0",
    "integrity": "sha512-Bive31c27++7qiAHcUVwbTUwXKX01XmFZWoc5OBNHxax+kIm4hd16qGAsTohD3u2K9kB0eWluTWi3tJKJ6WOkA==",
    "name": "@integration/package-1",
    "shasum": "582c6e794f72bb0cf1c04189205b91e697200991",
    "size": 539,
    "unpackedSize": 739,
    "version": "1.0.0",
  },
  Object {
    "bundled": Array [],
    "entryCount": 1,
    "filename": "package-4/package-4-1.0.0.tgz",
    "files": Array [
      Object {
        "mode": 420,
        "path": "package.json",
        "size": 224,
      },
    ],
    "id": "package-4@1.0.0",
    "integrity": "sha512-L0Yo+hDhClpjrDuKwTn8g4IhVOla4r3sn3y7dCmD4ZB1wpCchPd85jHG90XX+j5izxaD2egx1L1Zi1YYMu5fCg==",
    "name": "package-4",
    "shasum": "c2e12b3e84c2ac0570ed4c7dfb9e2fcc2d8fd988",
    "size": 230,
    "unpackedSize": 224,
    "version": "1.0.0",
  },
]
`);
  });
  /* eslint-enable max-len */
});
