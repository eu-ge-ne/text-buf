import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Insert into 0 line", () => {
  const buf = new TextBuf();

  buf.insert([0, 0], "Lorem ipsum");

  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.read([0, 0], [1, 0]), "Lorem ipsum");

  assert_tree(buf);
});

Deno.test("Insert into a line", () => {
  const buf = new TextBuf();
  buf.insert(0, "Lorem");

  buf.insert([0, 5], " ipsum");

  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.read([0, 0], [1, 0]), "Lorem ipsum");

  assert_tree(buf);
});

Deno.test("Insert into a line which does not exist", () => {
  const buf = new TextBuf();

  buf.insert([1, 0], "Lorem ipsum");

  assertEquals(buf.read(0), "");
  assertEquals(buf.read([0, 0], [1, 0]), "");

  assert_tree(buf);
});

Deno.test("Insert into a column which does not exist", () => {
  const buf = new TextBuf();

  buf.insert([0, 1], "Lorem ipsum");

  assertEquals(buf.read(0), "");
  assertEquals(buf.read([0, 0], [1, 0]), "");

  assert_tree(buf);
});
