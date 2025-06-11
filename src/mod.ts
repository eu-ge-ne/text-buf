import { delete_node } from "./deletion.ts";
import { insert_left, insert_right, InsertionCase } from "./insertion.ts";
import { bubble_update, NIL, node_from_text, read } from "./node.ts";
import { find_eol, find_node, successor } from "./querying.ts";
import {
  grow_slice,
  slice_growable,
  trim_slice_end,
  trim_slice_start,
} from "./slice.ts";
import { split } from "./splitting.ts";

/**
 * Represents position in text buffer. Can be either `number` or `[number, number]`:
 * - `number` is an offset from the start of buffer
 * - `[number, number]` are [line, column] indexes
 */
export type Position = number | readonly [number, number];

/**
 * `piece table` data structure implemented using `red-black tree`.
 */
export class TextBuf {
  /**
   * @ignore
   * @internal
   */
  root = NIL;

  /**
   * Creates instances of `TextBuf` interpreting text characters as `UTF-16 code units`. Visit [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters) for more details. Accepts optional initial text.
   *
   * @param `text` Initial text.
   * @returns `TextBuf` instance.
   */
  constructor(text?: string) {
    if (text && text.length > 0) {
      this.root = node_from_text(text);
      this.root.red = false;
    }
  }

  /**
   * Returns number of characters in the buffer.
   *
   * @returns Number of characters.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@eu-ge-ne/text-buf";
   *
   * const buf = new TextBuf("Lorem ipsum");
   *
   * assertEquals(buf.count, 11);
   * ```
   */
  get count(): number {
    return this.root.len;
  }

  /**
   * Returns number of lines in the buffer.
   *
   * @returns Number of lines.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@eu-ge-ne/text-buf";
   *
   * const buf = new TextBuf("Lorem\nipsum\ndolor\nsit\namet");
   *
   * assertEquals(buf.line_count, 5);
   * ```
   */
  get line_count(): number {
    return this.root.len === 0 ? 0 : this.root.eols_len + 1;
  }

  /**
   * Returns text in the buffer's section, specified by start (inclusive) and end (exclusive) positions.
   *
   * @param `start` Start position.
   * @param `end` Optional end position.
   * @returns Text.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@eu-ge-ne/text-buf";
   *
   * const buf = new TextBuf("Lorem\nipsum");
   *
   * assertEquals(buf.read(0), "Lorem\nipsum");
   * assertEquals(buf.read(6), "ipsum");
   * assertEquals(buf.read([0, 0], [1, 0]), "Lorem\n");
   * assertEquals(buf.read([1, 0], [2, 0]), "ipsum");
   * ```
   */
  read(start: Position, end?: Position): string | undefined {
    const i0 = this.#index(start);

    if (typeof i0 === "number") {
      const first = find_node(this.root, i0);

      if (first) {
        const { node, offset } = first;

        const i1 = (end ? this.#index(end) : undefined) ??
          Number.MAX_SAFE_INTEGER;
        const n = i1 - i0;

        return read(node, offset, n).reduce((r, x) => r + x, "");
      }
    }
  }

  /**
   * Inserts text into the buffer at the specified position.
   *
   * @param `position` Position at witch to insert the text.
   * @param `text` Text to insert.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@eu-ge-ne/text-buf";
   *
   * const buf = new TextBuf();
   *
   * buf.write(0, "Lorem");
   * buf.write([0, 5], " ipsum");
   *
   * assertEquals(buf.read(0), "Lorem ipsum");
   * ```
   */
  write(position: Position, text: string): void {
    let i = this.#index(position);

    if (typeof i === "number") {
      let p = NIL;
      let insert_case = InsertionCase.Root;

      for (let x = this.root; x !== NIL;) {
        if (i <= x.left.len) {
          insert_case = InsertionCase.Left;
          p = x;
          x = x.left;
        } else {
          i -= x.left.len;

          if (i < x.slice.len) {
            insert_case = InsertionCase.Split;
            p = x;
            x = NIL;
          } else {
            i -= x.slice.len;

            insert_case = InsertionCase.Right;
            p = x;
            x = x.right;
          }
        }
      }

      if (insert_case === InsertionCase.Right && slice_growable(p.slice)) {
        grow_slice(p.slice, text);

        bubble_update(p);
      } else {
        const child = node_from_text(text);

        switch (insert_case) {
          case InsertionCase.Root: {
            this.root = child;
            this.root.red = false;
            break;
          }
          case InsertionCase.Left: {
            insert_left(this, p, child);
            break;
          }
          case InsertionCase.Right: {
            insert_right(this, p, child);
            break;
          }
          case InsertionCase.Split: {
            const y = split(this, p, i, 0);
            insert_left(this, y, child);
            break;
          }
        }
      }
    }
  }

  /**
   * Removes characters in the buffer's section, specified by start (inclusive) and end (exclusive) positions.
   *
   * @param `start` Start position.
   * @param `end` Optional end position.
   *
   * @example
   *
   * ```ts
   * import { assertEquals } from "jsr:@std/assert";
   * import { TextBuf } from "jsr:@eu-ge-ne/text-buf";
   *
   * const buf = new TextBuf("Lorem ipsum");
   *
   * buf.erase(5, 11);
   *
   * assertEquals(buf.read(0), "Lorem");
   * ```
   */
  erase(start: Position, end?: Position): void {
    const i0 = this.#index(start);

    if (typeof i0 === "number") {
      const first = find_node(this.root, i0);

      if (first) {
        const i1 = (end ? this.#index(end) : undefined) ??
          Number.MAX_SAFE_INTEGER;

        const { node, offset } = first;
        const count = i1 - i0;
        const offset2 = offset + count;

        if (offset2 === node.slice.len) {
          if (offset === 0) {
            delete_node(this, node);
          } else {
            trim_slice_end(node.slice, count);
            bubble_update(node);
          }
        } else if (offset2 < node.slice.len) {
          if (offset === 0) {
            trim_slice_start(node.slice, count);
            bubble_update(node);
          } else {
            split(this, node, offset, count);
          }
        } else {
          let x = node;
          let i = 0;

          if (offset !== 0) {
            x = split(this, node, offset, 0);
          }

          const last = find_node(this.root, i1);
          if (last && last.offset !== 0) {
            split(this, last.node, last.offset, 0);
          }

          while ((x !== NIL) && (i < count)) {
            i += x.slice.len;

            const next = successor(x);

            delete_node(this, x);

            x = next;
          }
        }
      }
    }
  }

  #index(position: Position): number | undefined {
    let i: number | undefined;

    if (typeof position === "number") {
      i = position;
    } else {
      let line = position[0];
      if (line < 0) {
        line = Math.max(this.line_count + line, 0);
      }

      i = line === 0 ? 0 : find_eol(this.root, line - 1);
      if (typeof i === "number") {
        i += position[1];
      }
    }

    if (typeof i === "number") {
      if (i < 0) {
        i = Math.max(this.count + i, 0);
      }

      if (i <= this.count) {
        return i;
      }
    }
  }
}
