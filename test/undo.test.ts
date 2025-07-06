import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Undo insert", () => {
  const buf = new TextBuf();

  buf.insert(buf.count, "Lorem");
  assertEquals(buf.read(0), "Lorem");
  assertEquals(buf.count, 5);
  assert_tree(buf);

  const a = structuredClone(buf.root);
  buf.insert(buf.count, "Lorem");
  buf.root = a;

  assertEquals(buf.read(0), "Lorem");
  assertEquals(buf.count, 5);
  assert_tree(buf);
});
