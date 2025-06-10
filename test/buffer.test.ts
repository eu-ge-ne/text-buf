import { assertEquals } from "@std/assert";

import { Buffer } from "../src/buffer.ts";

Deno.test("Read", () => {
  const buf = new Buffer("Lorem ipsum");

  assertEquals(buf.read(5, 1), " ");
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
