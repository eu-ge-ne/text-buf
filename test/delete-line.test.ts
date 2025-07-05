import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Delete line", () => {
  const buf = new TextBuf("Lorem \nipsum \ndolor \nsit \namet ");

  assertEquals(buf.line_count, 5);

  buf.delete([4, 0], [5, 0]);

  assertEquals(buf.read(0), "Lorem \nipsum \ndolor \nsit \n");
  assertEquals(buf.count, 26);
  assertEquals(buf.line_count, 5);
  assert_tree(buf);

  buf.delete([3, 0], [4, 0]);

  assertEquals(buf.read(0), "Lorem \nipsum \ndolor \n");
  assertEquals(buf.count, 21);
  assertEquals(buf.line_count, 4);
  assert_tree(buf);

  buf.delete([2, 0], [3, 0]);

  assertEquals(buf.read(0), "Lorem \nipsum \n");
  assertEquals(buf.count, 14);
  assertEquals(buf.line_count, 3);
  assert_tree(buf);

  buf.delete([1, 0], [2, 0]);

  assertEquals(buf.read(0), "Lorem \n");
  assertEquals(buf.count, 7);
  assertEquals(buf.line_count, 2);
  assert_tree(buf);
});
