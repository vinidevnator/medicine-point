const Module = require("module");
const orig = Module._resolveFilename;
const path = require("node:path");
const NOOP = path.join(__dirname, "noop.cjs");
Module._resolveFilename = function (req, parent, ...rest) {
  if (req === "server-only") return NOOP;
  return orig.call(this, req, parent, ...rest);
};