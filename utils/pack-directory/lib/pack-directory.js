"use strict";

const fs = require("fs-extra");
const path = require("path");
const packlist = require("npm-packlist");
const tar = require("tar");
const tempWrite = require("temp-write");
const getPacked = require("@lerna/get-packed");
const runLifecycle = require("@lerna/run-lifecycle");

module.exports = packDirectory;

function packDirectory(pkg, opts) {
  const dir = pkg.location;
  const name =
    pkg.name[0] === "@"
      ? // scoped packages get special treatment
        pkg.name.substr(1).replace(/\//g, "-")
      : pkg.name;
  const outputFileName = `${name}-${pkg.version}.tgz`;
  const outputFilePath = path.relative(pkg.rootPath, path.join(dir, outputFileName));

  let chain = Promise.resolve();

  chain = chain.then(() => runLifecycle(pkg, "prepare", opts));
  chain = chain.then(() => runLifecycle(pkg, "prepack", opts));
  chain = chain.then(() => pkg.refresh());
  chain = chain.then(() => packlist({ path: dir }));
  chain = chain.then(files =>
    tar.create(
      {
        cwd: dir,
        prefix: "package/",
        portable: true,
        // Provide a specific date in the 1980s for the benefit of zip,
        // which is confounded by files dated at the Unix epoch 0.
        mtime: new Date("1985-10-26T08:15:00.000Z"),
        gzip: true,
      },
      // NOTE: node-tar does some Magic Stuff depending on prefixes for files
      //       specifically with @ signs, so we just neutralize that one
      //       and any such future "features" by prepending `./`
      files.map(f => `./${f}`)
    )
  );
  chain = chain.then(stream => tempWrite(stream, outputFileName));
  chain = chain.then(tmpFilePath =>
    getPacked(pkg, tmpFilePath, outputFilePath).then(packed =>
      Promise.resolve()
        .then(() => fs.move(tmpFilePath, outputFilePath, { overwrite: true }))
        .then(() => runLifecycle(pkg, "postpack", opts))
        .then(() => packed)
    )
  );

  return chain;
}
