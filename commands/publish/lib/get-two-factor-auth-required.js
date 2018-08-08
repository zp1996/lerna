"use strict";

const log = require("libnpm/log");
const profile = require("libnpm/profile");
const ValidationError = require("@lerna/validation-error");

module.exports = getTwoFactorAuthRequired;

function getTwoFactorAuthRequired(opts) {
  log.silly("getTwoFactorAuthRequired");

  if (opts.get("registry") !== "https://registry.npmjs.org/") {
    log.warn(
      "ETHIRDPARTY",
      `Skipping two-factor auth as most third-party registries do not support advanced npm functionality`
    );

    return Promise.resolve(false);
  }

  return profile.get(opts).then(
    result => {
      log.silly("2FA", result.tfa);

      if (result.tfa.pending) {
        // if 2FA is pending, it is disabled
        return false;
      }

      return result.tfa.mode === "auth-and-writes";
    },
    err => {
      // Log the error cleanly to stderr
      log.pause();
      console.error(err.message); // eslint-disable-line no-console
      log.resume();

      throw new ValidationError("ETWOFACTOR", "Unable to obtain two-factor auth mode");
    }
  );
}
