import { assertEquals, assertThrows } from "@std/assert";

import { Buffer } from "../src/buffer.ts";

Deno.test("Read", () => {
  const buf = new Buffer("Lorem ipsum");

  assertEquals(buf.text.slice(5, 6), " ");
});

Deno.test("0 newlines", () => {
  const buf = new Buffer("Lorem ipsum");

  assertEquals(buf.eol_starts, []);
  assertEquals(buf.eol_ends, []);
});

Deno.test("LF", () => {
  const buf = new Buffer("Lorem \nipsum \n");

  assertEquals(buf.eol_starts, [6, 13]);
  assertEquals(buf.eol_ends, [7, 14]);
});

Deno.test("CRLF", () => {
  const buf = new Buffer("Lorem \r\nipsum \r\n");

  assertEquals(buf.eol_starts, [6, 14]);
  assertEquals(buf.eol_ends, [8, 16]);
});

Deno.test("LF and CRLF", () => {
  const buf = new Buffer("Lorem \nipsum \r\n");

  assertEquals(buf.eol_starts, [6, 13]);
  assertEquals(buf.eol_ends, [7, 15]);
});

Deno.test("find_eol_index", () => {
  const buf = new Buffer("AA\r\nBB\nCC");

  assertEquals(buf.eol_starts.length, 2);

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
