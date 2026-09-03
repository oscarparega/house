import assert from "node:assert/strict";
import test from "node:test";

test("the project runs on a supported Node.js version", () => {
  assert.ok(Number(process.versions.node.split(".")[0]) >= 22);
});
