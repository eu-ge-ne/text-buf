import { assertEquals } from "@std/assert";

import { TextBuf } from "../src/text-buf.ts";
import { assert_tree } from "./assert.ts";

Deno.test("Insert into the end", () => {
  const buf = new TextBuf();

  buf.insert(buf.count, "Lorem");
  assertEquals(buf.read(0), "Lorem");
  assertEquals(buf.count, 5);
  assert_tree(buf);

  buf.insert(buf.count, " ipsum");
  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.count, 11);
  assert_tree(buf);

  buf.insert(buf.count, " dolor");
  assertEquals(buf.read(0), "Lorem ipsum dolor");
  assertEquals(buf.count, 17);
  assert_tree(buf);

  buf.insert(buf.count, " sit");
  assertEquals(buf.read(0), "Lorem ipsum dolor sit");
  assertEquals(buf.count, 21);
  assert_tree(buf);

  buf.insert(buf.count, " amet,");
  assertEquals(buf.read(0), "Lorem ipsum dolor sit amet,");
  assertEquals(buf.count, 27);
  assert_tree(buf);

  buf.insert(buf.count, " consectetur");
  assertEquals(buf.read(0), "Lorem ipsum dolor sit amet, consectetur");
  assertEquals(buf.count, 39);
  assert_tree(buf);

  buf.insert(buf.count, " adipiscing");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing",
  );
  assertEquals(buf.count, 50);
  assert_tree(buf);

  buf.insert(buf.count, " elit,");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  );
  assertEquals(buf.count, 56);
  assert_tree(buf);

  buf.insert(buf.count, " sed");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed",
  );
  assertEquals(buf.count, 60);
  assert_tree(buf);

  buf.insert(buf.count, " do");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
  );
  assertEquals(buf.count, 63);
  assert_tree(buf);

  buf.insert(buf.count, " eiusmod");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
  );
  assertEquals(buf.count, 71);
  assert_tree(buf);

  buf.insert(buf.count, " tempor");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  );
  assertEquals(buf.count, 78);
  assert_tree(buf);

  buf.insert(buf.count, " incididunt");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  );
  assertEquals(buf.count, 89);
  assert_tree(buf);

  buf.insert(buf.count, " ut");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut",
  );
  assertEquals(buf.count, 92);
  assert_tree(buf);

  buf.insert(buf.count, " labore");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  );
  assertEquals(buf.count, 99);
  assert_tree(buf);

  buf.insert(buf.count, " et");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
  );
  assertEquals(buf.count, 102);
  assert_tree(buf);

  buf.insert(buf.count, " dolore");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore",
  );
  assertEquals(buf.count, 109);
  assert_tree(buf);

  buf.insert(buf.count, " magna");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
  );
  assertEquals(buf.count, 115);
  assert_tree(buf);

  buf.insert(buf.count, " aliqua.");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 123);
  assert_tree(buf);
});

Deno.test("Insert into the beginning", () => {
  const buf = new TextBuf();

  buf.insert(0, " aliqua.");
  assertEquals(buf.read(0), " aliqua.");
  assertEquals(buf.count, 8);
  assert_tree(buf);

  buf.insert(0, " magna");
  assertEquals(buf.read(0), " magna aliqua.");
  assertEquals(buf.count, 14);
  assert_tree(buf);

  buf.insert(0, " dolore");
  assertEquals(buf.read(0), " dolore magna aliqua.");
  assertEquals(buf.count, 21);
  assert_tree(buf);

  buf.insert(0, " et");
  assertEquals(buf.read(0), " et dolore magna aliqua.");
  assertEquals(buf.count, 24);
  assert_tree(buf);

  buf.insert(0, " labore");
  assertEquals(buf.read(0), " labore et dolore magna aliqua.");
  assertEquals(buf.count, 31);
  assert_tree(buf);

  buf.insert(0, " ut");
  assertEquals(buf.read(0), " ut labore et dolore magna aliqua.");
  assertEquals(buf.count, 34);
  assert_tree(buf);

  buf.insert(0, " incididunt");
  assertEquals(
    buf.read(0),
    " incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 45);
  assert_tree(buf);

  buf.insert(0, " tempor");
  assertEquals(
    buf.read(0),
    " tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 52);
  assert_tree(buf);

  buf.insert(0, " eiusmod");
  assertEquals(
    buf.read(0),
    " eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 60);
  assert_tree(buf);

  buf.insert(0, " do");
  assertEquals(
    buf.read(0),
    " do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 63);
  assert_tree(buf);

  buf.insert(0, " sed");
  assertEquals(
    buf.read(0),
    " sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 67);
  assert_tree(buf);

  buf.insert(0, " elit,");
  assertEquals(
    buf.read(0),
    " elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 73);
  assert_tree(buf);

  buf.insert(0, " adipiscing");
  assertEquals(
    buf.read(0),
    " adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 84);
  assert_tree(buf);

  buf.insert(0, " consectetur");
  assertEquals(
    buf.read(0),
    " consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 96);
  assert_tree(buf);

  buf.insert(0, " amet,");
  assertEquals(
    buf.read(0),
    " amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 102);
  assert_tree(buf);

  buf.insert(0, " sit");
  assertEquals(
    buf.read(0),
    " sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 106);
  assert_tree(buf);

  buf.insert(0, " dolor");
  assertEquals(
    buf.read(0),
    " dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 112);
  assert_tree(buf);

  buf.insert(0, " ipsum");
  assertEquals(
    buf.read(0),
    " ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 118);
  assert_tree(buf);

  buf.insert(0, "Lorem");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 123);
  assert_tree(buf);
});

Deno.test("Insert splitting nodes", () => {
  const buf = new TextBuf();

  buf.insert(0, "Lorem aliqua.");
  assertEquals(buf.read(0), "Lorem aliqua.");
  assertEquals(buf.count, 13);
  assert_tree(buf);

  buf.insert(5, " ipsum magna");
  assertEquals(buf.read(0), "Lorem ipsum magna aliqua.");
  assertEquals(buf.count, 25);
  assert_tree(buf);

  buf.insert(11, " dolor dolore");
  assertEquals(buf.read(0), "Lorem ipsum dolor dolore magna aliqua.");
  assertEquals(buf.count, 38);
  assert_tree(buf);

  buf.insert(17, " sit et");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit et dolore magna aliqua.",
  );
  assertEquals(buf.count, 45);
  assert_tree(buf);

  buf.insert(21, " amet, labore");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 58);
  assert_tree(buf);

  buf.insert(27, " consectetur ut");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 73);
  assert_tree(buf);

  buf.insert(39, " adipiscing incididunt");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 95);
  assert_tree(buf);

  buf.insert(50, " elit, tempor");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 108);
  assert_tree(buf);

  buf.insert(56, " sed eiusmod");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 120);
  assert_tree(buf);

  buf.insert(60, " do");
  assertEquals(
    buf.read(0),
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  assertEquals(buf.count, 123);
  assert_tree(buf);
});

Deno.test("Insert at the negative index", () => {
  const buf = new TextBuf();

  buf.insert(0, "ipsum");
  assertEquals(buf.read(0), "ipsum");
  assertEquals(buf.count, 5);
  assert_tree(buf);

  buf.insert(-5, " ");
  assertEquals(buf.read(0), " ipsum");
  assertEquals(buf.count, 6);
  assert_tree(buf);

  buf.insert(-6, "Lorem");
  assertEquals(buf.read(0), "Lorem ipsum");
  assertEquals(buf.count, 11);
  assert_tree(buf);
});

Deno.test("Insert splitting node with fixup", () => {
  const buf = new TextBuf();

  buf.insert(0, "11");
  buf.insert(2, "22");

  buf.insert(2, "3");
  buf.insert(3, "3");

  buf.insert(4, "4");
  buf.insert(5, "4");

  assertEquals(buf.read(0), "11334422");

  buf.insert(4, "-");

  assertEquals(buf.read(0), "1133-4422");
  assert_tree(buf);
});
