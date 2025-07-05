import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

const EXPECTED =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function text_buf(): TextBuf {
  const buf = new TextBuf();

  buf.write(buf.count, "Lorem");
  buf.write(buf.count, " ipsum");
  buf.write(buf.count, " dolor");
  buf.write(buf.count, " sit");
  buf.write(buf.count, " amet,");
  buf.write(buf.count, " consectetur");
  buf.write(buf.count, " adipiscing");
  buf.write(buf.count, " elit,");
  buf.write(buf.count, " sed");
  buf.write(buf.count, " do");
  buf.write(buf.count, " eiusmod");
  buf.write(buf.count, " tempor");
  buf.write(buf.count, " incididunt");
  buf.write(buf.count, " ut");
  buf.write(buf.count, " labore");
  buf.write(buf.count, " et");
  buf.write(buf.count, " dolore");
  buf.write(buf.count, " magna");
  buf.write(buf.count, " aliqua.");

  return buf;
}

function text_buf_reversed(): TextBuf {
  const buf = new TextBuf();

  buf.write(0, " aliqua.");
  buf.write(0, " magna");
  buf.write(0, " dolore");
  buf.write(0, " et");
  buf.write(0, " labore");
  buf.write(0, " ut");
  buf.write(0, " incididunt");
  buf.write(0, " tempor");
  buf.write(0, " eiusmod");
  buf.write(0, " do");
  buf.write(0, " sed");
  buf.write(0, " elit,");
  buf.write(0, " adipiscing");
  buf.write(0, " consectetur");
  buf.write(0, " amet,");
  buf.write(0, " sit");
  buf.write(0, " dolor");
  buf.write(0, " ipsum");
  buf.write(0, "Lorem");

  return buf;
}

function test_delete_head(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertEquals(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_tree(buf);

    buf.delete(0, n);
    expected = expected.slice(n);
  }

  assertEquals(buf.read(0), "");
  assertEquals(buf.count, 0);
  assert_tree(buf);
}

function test_delete_tail(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertEquals(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_tree(buf);

    buf.delete(-n, buf.count);
    expected = expected.slice(0, -n);
  }

  assertEquals(buf.read(0), "");
  assertEquals(buf.count, 0);
  assert_tree(buf);
}

function test_delete_middle(buf: TextBuf, n: number): void {
  let expected = EXPECTED;

  while (expected.length > 0) {
    assertEquals(buf.read(0), expected);
    assertEquals(buf.count, expected.length);
    assert_tree(buf);

    const pos = Math.floor(buf.count / 2);
    buf.delete(pos, pos + n);
    expected = expected.slice(0, pos) + expected.slice(pos + n);
  }

  assertEquals(buf.read(0), expected);
  assertEquals(buf.count, 0);
  assert_tree(buf);
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text`, () => {
    test_delete_head(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the beginning of a text reversed`, () => {
    test_delete_head(text_buf_reversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text`, () => {
    test_delete_tail(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the end of a text reversed`, () => {
    test_delete_tail(text_buf_reversed(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of a text`, () => {
    test_delete_middle(text_buf(), n);
  });
}

for (let n = 1; n <= 10; n += 1) {
  Deno.test(`Delete ${n} chars from the middle of text reversed`, () => {
    test_delete_middle(text_buf_reversed(), n);
  });
}

Deno.test("Delete splitting nodes", () => {
  const buf = new TextBuf(EXPECTED);

  let expected = EXPECTED;

  for (let n = 2; buf.count > 0;) {
    const s = Math.floor(buf.count / n);
    for (let i = n - 1; i >= 1; i -= 1) {
      assertEquals(buf.read(0), expected);
      assertEquals(buf.count, expected.length);
      assert_tree(buf);

      buf.delete(s * i, s * i + 2);
      expected = expected.slice(0, s * i) + expected.slice(s * i + 2);
    }
    n += 1;
  }

  assertEquals(buf.read(0), expected);
  assertEquals(buf.count, 0);
  assert_tree(buf);
});

Deno.test("Delete count < 0", () => {
  const buf = new TextBuf("Lorem ipsum");

  buf.delete(5, -6);

  assertEquals(buf.read(0), "Lorem ipsum");
  assert_tree(buf);
});

Deno.test("Delete removes lines", () => {
  const buf = new TextBuf();

  buf.write(0, "Lorem");
  buf.write(5, "ipsum");
  buf.write(5, "\n");
  buf.write(11, "\n");

  buf.delete(0, 6);
  buf.delete(5, 6);

  assertEquals(buf.count, 5);
  assertEquals(buf.line_count, 1);
  assertEquals(buf.read(0), "ipsum");
  assertEquals(buf.read([0, 0], [1, 0]), "ipsum");
  assert_tree(buf);
});

Deno.test("Delete newline char removes line", () => {
  const buf = new TextBuf(" \n \n");

  assertEquals(buf.line_count, 3);

  buf.delete(1, 2);

  assertEquals(buf.read(0), "  \n");
  assertEquals(buf.line_count, 2);
  assert_tree(buf);
});

Deno.test("Delete first newline char removes line", () => {
  const buf = new TextBuf("\n\n");

  assertEquals(buf.line_count, 3);

  buf.delete(0, 1);

  assertEquals(buf.read(0), "\n");
  assertEquals(buf.line_count, 2);
  assert_tree(buf);
});

Deno.test("Delete line followed by newline", () => {
  const buf = new TextBuf(" \n \n\n \n");

  assertEquals(buf.line_count, 5);

  buf.delete(2, 4);

  assertEquals(buf.read(0), " \n\n \n");
  assertEquals(buf.line_count, 4);
  assert_tree(buf);
});
