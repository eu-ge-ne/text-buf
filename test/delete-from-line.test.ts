import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_generator, assert_tree } from "./assert.ts";

Deno.test("Delete from line", () => {
  const buf = new TextBuf("Lorem \nipsum \ndolor \nsit \namet");

  assertEquals(buf.line_count, 5);

  buf.delete2([3, 0]);

  assert_generator(buf.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(buf.count, 21);
  assertEquals(buf.line_count, 4);
  assert_tree(buf);

  buf.delete2([1, 0]);

  assert_generator(buf.read(0), "Lorem \n");
  assertEquals(buf.count, 7);
  assertEquals(buf.line_count, 2);
  assert_tree(buf);
});
