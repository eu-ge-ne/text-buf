# @eu-ge-ne/text-buf

`piece table` data structure implemented using `red-black tree`.

[![JSR](https://jsr.io/badges/@eu-ge-ne/text-buf)](https://jsr.io/@eu-ge-ne/text-buf)
[![JSR Score](https://jsr.io/badges/@eu-ge-ne/text-buf/score)](https://jsr.io/@eu-ge-ne/text-buf)
[![codecov](https://codecov.io/gh/eu-ge-ne/text-buf/branch/main/graph/badge.svg?token=6H0QTYEJNE)](https://codecov.io/gh/eu-ge-ne/text-buf)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=eu-ge-ne_text-buf&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=eu-ge-ne_text-buf)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=eu-ge-ne_text-buf&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=eu-ge-ne_text-buf)

- [Installation](#installation)
  - [Deno](#deno)
  - [Node.js](#nodejs)
  - [Bun](#bun)
- [Examples](#examples)
- [API](#api)
  - [`TextBuf()`](#textbuf)
  - [`TextBuf:count`](#textbufcount)
  - [`TextBuf:line_count`](#textbufline_count)
  - [`TextBuf.proto.read()`](#textbufprotoread)
  - [`TextBuf.proto.write()`](#textbufprotowrite)
  - [`TextBuf.proto.erase()`](#textbufprotoerase)
- [Benchmarks](#benchmarks)
  - [Create](#create)
  - [Line](#line)
  - [Write](#write)
  - [Erase](#erase)
- [License](#license)

> In computing, a piece table is a data structure typically used to represent a
> text document while it is edited in a text editor. Initially a reference (or
> 'span') to the whole of the original file is created, which represents the as
> yet unchanged file. Subsequent inserts and deletes replace a span by
> combinations of one, two, or three references to sections of either the
> original document or to a buffer holding inserted text.

&mdash;
<cite>[Crowley, Charles (10 June 1998). "Data Structures for Text Sequences - 6.4 The piece table method"](https://web.archive.org/web/20180223071931/https://www.cs.unm.edu/~crowley/papers/sds.pdf)</cite>

## Installation

### Deno

```bash
deno add jsr:@eu-ge-ne/text-buf
```

### Node.js

```bash
# pnpm
pnpm i jsr:@eu-ge-ne/text-buf

# yarn
yarn add jsr:@eu-ge-ne/text-buf

# npm
npx jsr add @eu-ge-ne/text-buf
```

### Bun

```bash
bunx jsr add @eu-ge-ne/text-buf
```

## Examples

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf();

assertEquals(buf.count, 0);
assertEquals(buf.line_count, 0);
assertEquals(buf.read(0), undefined);

buf.write(0, "Lorem");

assertEquals(buf.count, 5);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0), "Lorem");

buf.write(5, "ipsum");

assertEquals(buf.count, 10);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0), "Loremipsum");

buf.write(5, "\n");
buf.write(11, "\n");

assertEquals(buf.count, 12);
assertEquals(buf.line_count, 3);
assertEquals(buf.read(0), "Lorem\nipsum\n");
assertEquals(buf.read([0, 0], [1, 0]), "Lorem\n");
assertEquals(buf.read([1, 0], [2, 0]), "ipsum\n");
assertEquals(buf.read([2, 0], [3, 0]), undefined);

buf.erase(0, 6);
buf.erase(5, 6);

assertEquals(buf.count, 5);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0), "ipsum");
assertEquals(buf.read([0, 0], [1, 0]), "ipsum");
```

## API

### `TextBuf()`

Creates instances of `TextBuf` interpreting text characters as
`UTF-16 code units`. Visit
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters)
for more details. Accepts optional initial text.

Syntax

```ts ignore
new TextBuf(text?: string)
```

### `TextBuf:count`

Returns number of characters in the buffer.

Syntax

```ts ignore
get count(): number
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem ipsum");

assertEquals(buf.count, 11);
```

### `TextBuf:line_count`

Returns number of lines in the buffer.

Syntax

```ts ignore
get line_count(): number
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");

assertEquals(buf.line_count, 5);
```

### `TextBuf.proto.read()`

Returns text in the buffer's section, specified by start (inclusive) and end
(exclusive) positions.

Syntax

```ts ignore
read(start: Position, end?: Position): string
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem\nipsum");

assertEquals(buf.read(0), "Lorem\nipsum");
assertEquals(buf.read(6), "ipsum");
assertEquals(buf.read([0, 0], [1, 0]), "Lorem\n");
assertEquals(buf.read([1, 0], [2, 0]), "ipsum");
```

### `TextBuf.proto.write()`

Inserts text into the buffer at the specified position.

Syntax

```ts ignore
write(position: Position, text: string): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf();

buf.write(0, "Lorem");
buf.write([0, 5], " ipsum");

assertEquals(buf.read(0), "Lorem ipsum");
```

### `TextBuf.proto.erase()`

Removes characters in the buffer's section, specified by start (inclusive) and
end (exclusive) positions.

Syntax

```ts ignore
erase(start: Position, end?: Position): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem ipsum");

buf.erase(5, 11);

assertEquals(buf.read(0), "Lorem");
```

## Benchmarks

### Create

```bash
❯ deno bench bench/create.bench.ts
    CPU | Apple M4 Pro
Runtime | Deno 2.3.3 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/create.bench.ts

benchmark            time/iter (avg)        iter/s      (min … max)           p75      p99     p995
-------------------- ----------------------------- --------------------- --------------------------

group Create
Creating a TextBuf            3.0 ms         334.5 (  2.8 ms …   3.9 ms)   3.0 ms   3.8 ms   3.9 ms
Creating a string             2.7 ms         371.5 (  2.6 ms …   3.2 ms)   2.7 ms   3.2 ms   3.2 ms

summary
  Creating a TextBuf
     1.11x slower than Creating a string
```

### Line

```bash
❯ deno bench bench/line.bench.ts
Check file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/line.bench.ts
    CPU | Apple M4 Pro
Runtime | Deno 2.3.3 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/line.bench.ts

benchmark                       time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------------- ----------------------------- --------------------- --------------------------

group Line
Accessing a line in a TextBuf           91.9 µs        10,880 ( 85.5 µs … 175.8 µs)  89.6 µs 127.3 µs 135.1 µs
Accessing a line in a string            40.6 ms          24.6 ( 39.6 ms …  43.5 ms)  41.2 ms  43.5 ms  43.5 ms

summary
  Accessing a line in a TextBuf
   442.00x faster than Accessing a line in a string
```

### Write

```bash
❯ deno bench bench/write.bench.ts
Check file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/write.bench.ts
    CPU | Apple M4 Pro
Runtime | Deno 2.3.3 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/write.bench.ts

benchmark                  time/iter (avg)        iter/s      (min … max)           p75      p99     p995
-------------------------- ----------------------------- --------------------- --------------------------

group Append
Appending into a TextBuf           26.7 ms          37.4 ( 25.6 ms …  31.9 ms)  27.3 ms  31.9 ms  31.9 ms
Appending into a string             9.9 ms         100.9 (  9.7 ms …  11.9 ms)   9.9 ms  11.9 ms  11.9 ms

summary
  Appending into a TextBuf
     2.70x slower than Appending into a string

group Insert
Inserting into a TextBuf           89.7 ms          11.2 ( 89.2 ms …  90.8 ms)  89.9 ms  90.8 ms  90.8 ms
Inserting into a string              1.5 s           0.7 (   1.4 s …    1.7 s)    1.6 s    1.7 s    1.7 s

summary
  Inserting into a TextBuf
    17.05x faster than Inserting into a string
```

### Erase

```bash
❯ deno bench bench/erase.bench.ts
Check file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/erase.bench.ts
    CPU | Apple M4 Pro
Runtime | Deno 2.3.3 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/erase.bench.ts

benchmark                 time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------- ----------------------------- --------------------- --------------------------

group Trim
Trimming a TextBuf                 3.3 ms         299.1 (  2.7 ms …   4.0 ms)   3.5 ms   3.7 ms   4.0 ms
Trimming a string                395.4 µs         2,529 (368.5 µs … 758.2 µs) 400.7 µs 698.0 µs 719.3 µs

summary
  Trimming a TextBuf
     8.46x slower than Trimming a string

group Delete
Deleting from a TextBuf            8.2 ms         121.4 (  6.8 ms …  10.5 ms)   8.5 ms  10.5 ms  10.5 ms
Deleting from a string           185.4 ms           5.4 (168.5 ms … 260.4 ms) 192.3 ms 260.4 ms 260.4 ms

summary
  Deleting from a TextBuf
    22.51x faster than Deleting from a string
```

## License

[MIT](https://choosealicense.com/licenses/mit)
