import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_generator, assert_tree } from "./assert.ts";

Deno.test("Undo insert", () => {
  const buf = new TextBuf();

  buf.insert(buf.count, "Lorem");
  assert_generator(buf.read(0), "Lorem");
  assertEquals(buf.count, 5);
  assert_tree(buf);

  const a = structuredClone(buf.root);
  buf.insert(buf.count, "Lorem");
  buf.root = a;

  assert_generator(buf.read(0), "Lorem");
  assertEquals(buf.count, 5);
  assert_tree(buf);
});
