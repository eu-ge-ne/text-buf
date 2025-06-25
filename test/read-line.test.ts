import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Empty", () => {
  const buf = new TextBuf();

  assertEquals(buf.line_count, 0);
  assertEquals(buf.read([0, 0], [1, 0]), "");

  assert_tree(buf);
});

Deno.test("1 line", () => {
  const buf = new TextBuf("0");

  assertEquals(buf.line_count, 1);
  assertEquals(buf.read([0, 0], [1, 0]), "0");

  assert_tree(buf);
});

Deno.test("2 lines", () => {
  const buf = new TextBuf("0\n");

  assertEquals(buf.line_count, 2);
  assertEquals(buf.read([0, 0], [1, 0]), "0\n");
  assertEquals(buf.read([1, 0], [2, 0]), "");

  assert_tree(buf);
});

Deno.test("3 lines", () => {
  const buf = new TextBuf("0\n1\n");

  assertEquals(buf.line_count, 3);
  assertEquals(buf.read([0, 0], [1, 0]), "0\n");
  assertEquals(buf.read([1, 0], [2, 0]), "1\n");
  assertEquals(buf.read([2, 0], [3, 0]), "");

  assert_tree(buf);
});

Deno.test("Line at valid index", () => {
  const buf = new TextBuf();

  buf.write(0, "Lorem\naliqua.");
  buf.write(6, "ipsum\nmagna\n");
  buf.write(12, "dolor\ndolore\n");
  buf.write(18, "sit\net\n");
  buf.write(22, "amet,\nlabore\n");
  buf.write(28, "consectetur\nut\n");
  buf.write(40, "adipiscing\nincididunt\n");
  buf.write(51, "elit,\ntempor\n");
  buf.write(57, "sed\neiusmod\n");
  buf.write(61, "do\n");

  assertEquals(buf.read([0, 0], [1, 0]), "Lorem\n");
  assertEquals(buf.read([1, 0], [2, 0]), "ipsum\n");
  assertEquals(buf.read([2, 0], [3, 0]), "dolor\n");
  assertEquals(buf.read([3, 0], [4, 0]), "sit\n");
  assertEquals(buf.read([4, 0], [5, 0]), "amet,\n");
  assertEquals(buf.read([5, 0], [6, 0]), "consectetur\n");
  assertEquals(buf.read([6, 0], [7, 0]), "adipiscing\n");
  assertEquals(buf.read([7, 0], [8, 0]), "elit,\n");
  assertEquals(buf.read([8, 0], [9, 0]), "sed\n");
  assertEquals(buf.read([9, 0], [10, 0]), "do\n");
  assertEquals(buf.read([10, 0], [11, 0]), "eiusmod\n");
  assertEquals(buf.read([11, 0], [12, 0]), "tempor\n");
  assertEquals(buf.read([12, 0], [13, 0]), "incididunt\n");
  assertEquals(buf.read([13, 0], [14, 0]), "ut\n");
  assertEquals(buf.read([14, 0], [15, 0]), "labore\n");
  assertEquals(buf.read([15, 0], [16, 0]), "et\n");
  assertEquals(buf.read([16, 0], [17, 0]), "dolore\n");
  assertEquals(buf.read([17, 0], [18, 0]), "magna\n");
  assertEquals(buf.read([18, 0], [19, 0]), "aliqua.");

  assert_tree(buf);
});

Deno.test("Line at index >= line_count", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assertEquals(buf.read([4, 0], [5, 0]), "amet");
  assertEquals(buf.read([5, 0], [6, 0]), "");
  assertEquals(buf.read([6, 0], [7, 0]), "");

  assert_tree(buf);
});

Deno.test("Line at index < 0", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assertEquals(buf.read([0, 0], [1, 0]), "Lorem\n");
  assertEquals(buf.read([-1, 0], [buf.line_count, 0]), "amet");
  assertEquals(buf.read([-2, 0], [-1, 0]), "sit\n");

  assert_tree(buf);
});

Deno.test("Write adds lines", () => {
  const buf = new TextBuf();

  for (let i = 0; i < 10; i += 1) {
    buf.write(buf.count, `${i}\n`);

    assertEquals(buf.line_count, i + 2);
    assertEquals(buf.read([i, 0], [i + 1, 0]), `${i}\n`);
    assert_tree(buf);
  }

  assertEquals(buf.line_count, 11);
  assertEquals(buf.read([11, 0], [12, 0]), "");
  assert_tree(buf);
});
