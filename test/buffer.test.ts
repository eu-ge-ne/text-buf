import { assertEquals, assertThrows } from "@std/assert";

import { Buffer } from "../src/buffer.ts";

Deno.test("Read", () => {
  const buf = new Buffer("Lorem ipsum");

  assertEquals(buf.text.slice(5, 6), " ");
});

Deno.test("0 newlines", () => {
  const buf = new Buffer("Lorem ipsum");

  assertEquals(buf.eols_len, 0);
  assertEquals([...buf.eols], []);
});

Deno.test("LF", () => {
  const buf = new Buffer("Lorem \nipsum \n");

  assertEquals(buf.eols_len, 2);
  assertEquals([...buf.eols], [6, 7, 13, 14]);
});

Deno.test("CRLF", () => {
  const buf = new Buffer("Lorem \r\nipsum \r\n");

  assertEquals(buf.eols_len, 2);
  assertEquals([...buf.eols], [6, 8, 14, 16]);
});

Deno.test("LF and CRLF", () => {
  const buf = new Buffer("Lorem \nipsum \r\n");

  assertEquals(buf.eols_len, 2);
  assertEquals([...buf.eols], [6, 7, 13, 15]);
});

Deno.test("find_eol_index", () => {
  const buf = new Buffer("AA\r\nBB\nCC");

  assertEquals(buf.eols_len, 2);

  assertEquals(buf.find_eol_index(0, 0), 0);
  assertEquals(buf.find_eol_index(1, 0), 0);

  assertEquals(buf.find_eol_index(2, 0), 0);
  assertThrows(() => buf.find_eol_index(3, 0));

  assertEquals(buf.find_eol_index(4, 0), 1);
  assertEquals(buf.find_eol_index(5, 0), 1);

  assertEquals(buf.find_eol_index(6, 0), 1);

  assertEquals(buf.find_eol_index(7, 0), 2);
  assertEquals(buf.find_eol_index(8, 0), 2);
});

Deno.test("slice_eols", () => {
  const buf = new Buffer("1\n2\n3\n4\n5");
  //                      01 23 45 67 8
  //                       0  1  2  3

  assertEquals(buf.eols_len, 4);

  assertEquals(buf.slice_eols(0, 9), [0, 4]);

  assertEquals(buf.slice_eols(1, 9), [0, 4]);
  assertEquals(buf.slice_eols(2, 9), [1, 4]);
  assertEquals(buf.slice_eols(3, 9), [1, 4]);
  assertEquals(buf.slice_eols(4, 9), [2, 4]);
  assertEquals(buf.slice_eols(5, 9), [2, 4]);
  assertEquals(buf.slice_eols(6, 9), [3, 4]);
  assertEquals(buf.slice_eols(7, 9), [3, 4]);
  assertEquals(buf.slice_eols(8, 9), [4, 4]);

  assertEquals(buf.slice_eols(0, 8), [0, 4]);
  assertEquals(buf.slice_eols(0, 7), [0, 3]);
  assertEquals(buf.slice_eols(0, 6), [0, 3]);
  assertEquals(buf.slice_eols(0, 5), [0, 2]);
  assertEquals(buf.slice_eols(0, 4), [0, 2]);
  assertEquals(buf.slice_eols(0, 3), [0, 1]);
  assertEquals(buf.slice_eols(0, 2), [0, 1]);
  assertEquals(buf.slice_eols(0, 1), [0, 0]);

  assertEquals(buf.slice_eols(1, 8), [0, 4]);
  assertEquals(buf.slice_eols(2, 7), [1, 3]);
  assertEquals(buf.slice_eols(3, 6), [1, 3]);
  assertEquals(buf.slice_eols(4, 5), [2, 2]);
});
