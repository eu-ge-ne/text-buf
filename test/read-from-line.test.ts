import { TextBuf } from "../src/text-buf.ts";
import { assert_generator, assert_tree } from "./assert.ts";

Deno.test("Line at valid index", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assert_generator(buf.read([1, 0]), "ipsum\ndolor\nsit\namet");
  assert_generator(buf.read([2, 0]), "dolor\nsit\namet");
  assert_generator(buf.read([3, 0]), "sit\namet");
  assert_generator(buf.read([4, 0]), "amet");

  assert_tree(buf);
});

Deno.test("Line at index >= line_count", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read([4, 0]), "amet");
  assert_generator(buf.read([5, 0]), "");
  assert_generator(buf.read([6, 0]), "");

  assert_tree(buf);
});

Deno.test("Line at index < 0", () => {
  const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

  assert_generator(buf.read([0, 0]), "Lorem\nipsum\ndolor\nsit\namet");
  assert_generator(buf.read([-1, 0]), "amet");
  assert_generator(buf.read([-2, 0]), "sit\namet");

  assert_tree(buf);
});
