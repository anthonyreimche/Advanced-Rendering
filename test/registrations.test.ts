import { test } from "node:test";
import assert from "node:assert/strict";
import { activate } from "../src/index.ts";

test("every transform owns both its baseline and its highlight roll-off", () => {
  const registered: Record<string, unknown>[] = [];
  activate({ registerPipeline: (c) => void registered.push({ ...c }) });
  assert.equal(registered.length, 10);
  for (const p of registered) {
    assert.equal(p.skipBaseCurve, true, String(p.id));
    assert.equal(p.skipToneShoulder, true, String(p.id));
  }
});
