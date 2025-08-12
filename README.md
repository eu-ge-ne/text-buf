# @eu-ge-ne/text-buf

`Piece Table` data structure implemented using `Red-Black Tree`

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
  - [`TextBuf.proto.save()`](#textbufprotosave)
  - [`TextBuf.proto.restore()`](#textbufprotorestore)
  - [`TextBuf.proto.read()`](#textbufprotoread)
  - [`TextBuf.proto.insert()`](#textbufprotoinsert)
  - [`TextBuf.proto.append()`](#textbufprotoappend)
  - [`TextBuf.proto.delete()`](#textbufprotodelete)
- [Benchmarks](#benchmarks)
  - [Create](#create)
  - [Line](#line)
  - [Insert](#insert)
  - [Delete](#delete)
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
assertEquals(buf.read(0).toArray().join(""), "");

buf.insert(0, "Lorem");

assertEquals(buf.count, 5);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0).toArray().join(""), "Lorem");

buf.insert(5, "ipsum");

assertEquals(buf.count, 10);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0).toArray().join(""), "Loremipsum");

buf.insert(5, "\n");
buf.insert(11, "\n");

assertEquals(buf.count, 12);
assertEquals(buf.line_count, 3);
assertEquals(buf.read(0).toArray().join(""), "Lorem\nipsum\n");
assertEquals(buf.read([0, 0], [1, 0]).toArray().join(""), "Lorem\n");
assertEquals(buf.read([1, 0], [2, 0]).toArray().join(""), "ipsum\n");
assertEquals(buf.read([2, 0], [3, 0]).toArray().join(""), "");

buf.delete(0, 6);
buf.delete(5, 6);

assertEquals(buf.count, 5);
assertEquals(buf.line_count, 1);
assertEquals(buf.read(0).toArray().join(""), "ipsum");
assertEquals(buf.read([0, 0], [1, 0]).toArray().join(""), "ipsum");
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

### `TextBuf.proto.save()`

Saves snapshot

Syntax

```ts ignore
save(): Node
```

Example

```ts
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem\nipsum");

buf.save();
```

### `TextBuf.proto.restore()`

Restores a snapshot

Syntax

```ts ignore
restore(node: Node): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("0");

const snapshot = buf.save();
buf.insert(0, "Lorem ipsum");
buf.restore(snapshot);

assertEquals(buf.read(0).toArray().join(""), "0");
```

### `TextBuf.proto.read()`

Returns text in the buffer's section, specified by start (inclusive) and end
(exclusive) positions.

Syntax

```ts ignore
read(start: Position, end?: Position): Generator<string>
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem\nipsum");

assertEquals(buf.read(0).toArray().join(""), "Lorem\nipsum");
assertEquals(buf.read(6).toArray().join(""), "ipsum");
assertEquals(buf.read([0, 0], [1, 0]).toArray().join(""), "Lorem\n");
assertEquals(buf.read([1, 0], [2, 0]).toArray().join(""), "ipsum");
```

### `TextBuf.proto.insert()`

Inserts text into the buffer at the specified position

Syntax

```ts ignore
insert(pos: Position, text: string): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf();

buf.insert(0, "Lorem");
buf.insert([0, 5], " ipsum");

assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
```

### `TextBuf.proto.append()`

Appends text to the buffer

Syntax

```ts ignore
append(text: string): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf();

buf.insert(0, "Lorem");
buf.append(" ipsum");

assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
```

### `TextBuf.proto.delete()`

Removes characters in the buffer's section, specified by start (inclusive) and
end (exclusive) positions.

Syntax

```ts ignore
delete(start: Position, end?: Position): void
```

Example

```ts
import { assertEquals } from "jsr:@std/assert";
import { TextBuf } from "jsr:@eu-ge-ne/text-buf";

const buf = new TextBuf("Lorem ipsum");

buf.delete(5, 11);

assertEquals(buf.read(0).toArray().join(""), "Lorem");
```

## Benchmarks

### Create

```bash
    CPU | Apple M4 Pro
Runtime | Deno 2.4.0 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/create.bench.ts

| benchmark            | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| -------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |

group Create
| Creating a TextBuf   |          1.8 ms |         571.1 | (  1.6 ms …   2.4 ms) |   1.7 ms |   2.3 ms |   2.3 ms |
| Creating a string    |          1.6 ms |         633.5 | (  1.5 ms …   1.9 ms) |   1.6 ms |   1.9 ms |   1.9 ms |

summary
  Creating a TextBuf
     1.11x slower than Creating a string
```

### Line

```bash
    CPU | Apple M4 Pro
Runtime | Deno 2.4.0 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/line.bench.ts

| benchmark                       | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |

group Line
| Accessing a line in a TextBuf   |         61.7 µs |        16,220 | ( 54.6 µs … 164.2 µs) |  62.6 µs |  89.8 µs |  96.2 µs |
| Accessing a line in a string    |         27.3 ms |          36.7 | ( 26.2 ms …  29.5 ms) |  27.8 ms |  29.5 ms |  29.5 ms |

summary
  Accessing a line in a TextBuf
   442.10x faster than Accessing a line in a string
```

### Insert

```bash
    CPU | Apple M4 Pro
Runtime | Deno 2.4.0 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/insert.bench.ts

| benchmark                  | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| -------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |

group Append
| Appending into a TextBuf   |         17.7 ms |          56.4 | ( 16.5 ms …  22.9 ms) |  18.1 ms |  22.9 ms |  22.9 ms |
| Appending into a string    |          6.1 ms |         164.2 | (  5.7 ms …   6.7 ms) |   6.1 ms |   6.7 ms |   6.7 ms |

summary
  Appending into a TextBuf
     2.91x slower than Appending into a string

group Insert
| Inserting into a TextBuf   |         66.8 ms |          15.0 | ( 62.9 ms …  73.5 ms) |  67.6 ms |  73.5 ms |  73.5 ms |
| Inserting into a string    |           1.3 s |           0.8 | (   1.2 s …    1.4 s) |    1.4 s |    1.4 s |    1.4 s |

summary
  Inserting into a TextBuf
    19.38x faster than Inserting into a string
```

### Delete

```bash
    CPU | Apple M4 Pro
Runtime | Deno 2.4.0 (aarch64-apple-darwin)

file:///Users/eug/Dev/github.com/eu-ge-ne/text-buf/bench/delete.bench.ts

| benchmark                 | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |

group Trim
| Trimming a TextBuf        |          2.2 ms |         447.4 | (  1.8 ms …   4.9 ms) |   2.3 ms |   3.0 ms |   3.0 ms |
| Trimming a string         |        261.6 µs |         3,823 | (230.6 µs … 593.6 µs) | 265.9 µs | 486.6 µs | 504.7 µs |

summary
  Trimming a TextBuf
     8.54x slower than Trimming a string

group Delete
| Deleting from a TextBuf   |          5.4 ms |         184.1 | (  4.8 ms …   6.3 ms) |   5.6 ms |   6.0 ms |   6.3 ms |
| Deleting from a string    |        120.7 ms |           8.3 | (120.5 ms … 120.9 ms) | 120.8 ms | 120.9 ms | 120.9 ms |

summary
  Deleting from a TextBuf
    22.22x faster than Deleting from a string
```

## License

[MIT](https://choosealicense.com/licenses/mit)
