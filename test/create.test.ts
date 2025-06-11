import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Create empty", () => {
  const buf = new TextBuf();

  assertEquals(buf.read(0), undefined);
  assertEquals(buf.count, 0);
  assertEquals(buf.line_count, 0);

  assert_tree(buf);
});

Deno.test("Create", () => {
  const buf = new TextBuf("Lorem ipsum");

  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.count, 11);
  assertEquals(buf.line_count, 1);

  assert_tree(buf);
});
