import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Read empty", () => {
  const buf = new TextBuf();

  assertEquals(buf.read(0), "");
  assert_tree(buf);
});

Deno.test("Read", () => {
  const buf = new TextBuf("Lorem ipsum dolor");

  assertEquals(buf.read(6, 12), "ipsum ");
  assert_tree(buf);
});

Deno.test("Read at start >= count", () => {
  const buf = new TextBuf("Lorem");

  assertEquals(buf.read(4), "m");
  assertEquals(buf.read(5), "");
  assertEquals(buf.read(6), "");

  assert_tree(buf);
});

Deno.test("Read at start < 0", () => {
  const buf = new TextBuf("Lorem");

  assertEquals(buf.read(0), "Lorem");
  assertEquals(buf.read(-1), "m");
  assertEquals(buf.read(-2), "em");

  assert_tree(buf);
});
