import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Write to 0 line", () => {
  const buf = new TextBuf();

  buf.write([0, 0], "Lorem ipsum");

  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.read([0, 0], [1, 0]), "Lorem ipsum");

  assert_tree(buf);
});

Deno.test("Write to a line", () => {
  const buf = new TextBuf();
  buf.write(0, "Lorem");

  buf.write([0, 5], " ipsum");

  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.read([0, 0], [1, 0]), "Lorem ipsum");

  assert_tree(buf);
});

Deno.test("Write to a line which does not exist", () => {
  const buf = new TextBuf();

  buf.write([1, 0], "Lorem ipsum");

  assertEquals(buf.read(0), undefined);
  assertEquals(buf.read([0, 0], [1, 0]), undefined);

  assert_tree(buf);
});

Deno.test("Write to a column which does not exist", () => {
  const buf = new TextBuf();

  buf.write([0, 1], "Lorem ipsum");

  assertEquals(buf.read(0), undefined);
  assertEquals(buf.read([0, 0], [1, 0]), undefined);

  assert_tree(buf);
});
