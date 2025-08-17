import { assertEquals } from "@std/assert";

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

  assertEquals(buf.find_eol(0, 0), 0);
  assertEquals(buf.find_eol(0, 1), 0);

  assertEquals(buf.find_eol(0, 2), 0);
  assertEquals(buf.find_eol(0, 3), 1);

  assertEquals(buf.find_eol(0, 4), 1);
  assertEquals(buf.find_eol(0, 5), 1);

  assertEquals(buf.find_eol(0, 6), 1);

  assertEquals(buf.find_eol(0, 7), 2);
  assertEquals(buf.find_eol(0, 8), 2);
});
