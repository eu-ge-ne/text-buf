import { Buffer } from "./buffer.ts";
import { bubble, create_node, NIL, type Node, successor } from "./node.ts";
import type { Position } from "./position.ts";
import { Tree } from "./tree.ts";

export const enum InsertionCase {
  Root,
  Left,
  Right,
  Split,
}

/**
 * `piece table` data structure implemented using `red-black tree`.
 */
export class TextBuf {
  /**
   * @ignore
   * @internal
   */
  tree: Tree = new Tree();

  /**
   * Creates instances of `TextBuf` interpreting text characters as `UTF-16 code units`. Visit [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters) for more details. Accepts optional initial text.
   *
   * @param `text` Initial text.
   * @returns `TextBuf` instance.
   */
  constructor(text?: string) {
    if (text && text.length > 0) {
      this.tree.root = this.#create_node(text);
      this.tree.root.red = false;
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
    return this.tree.root.total_len;
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
    return this.tree.root.total_len === 0
      ? 0
      : this.tree.root.total_eols_len + 1;
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
  read(start: Position, end?: Position): string {
    const start_i = this.#index(start);
    if (typeof start_i === "undefined") {
      return "";
    }

    const first = this.tree.find_node(start_i);
    if (!first) {
      return "";
    }

    const { node, offset } = first;

    const end_i = (end ? this.#index(end) : undefined) ??
      Number.MAX_SAFE_INTEGER;
    const n = end_i - start_i;

    return this.tree.read(node, offset, n).reduce((r, x) => r + x, "");
  }

  /**
   * Inserts text into the buffer at the specified position.
   *
   * @param `pos` Position at witch to insert the text.
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
   * buf.insert(0, "Lorem");
   * buf.insert([0, 5], " ipsum");
   *
   * assertEquals(buf.read(0), "Lorem ipsum");
   * ```
   */
  insert(pos: Position, text: string): void {
    let i = this.#index(pos);

    if (typeof i === "number") {
      let p = NIL;
      let insert_case = InsertionCase.Root;

      for (let x = this.tree.root; x !== NIL;) {
        if (i <= x.left.total_len) {
          insert_case = InsertionCase.Left;
          p = x;
          x = x.left;
        } else {
          i -= x.left.total_len;

          if (i < x.slice_len) {
            insert_case = InsertionCase.Split;
            p = x;
            x = NIL;
          } else {
            i -= x.slice_len;

            insert_case = InsertionCase.Right;
            p = x;
            x = x.right;
          }
        }
      }

      if (insert_case === InsertionCase.Right && this.tree.node_growable(p)) {
        this.tree.grow_node(p, text);

        bubble(p);
      } else {
        const child = this.#create_node(text);

        switch (insert_case) {
          case InsertionCase.Root: {
            this.tree.root = child;
            this.tree.root.red = false;
            break;
          }
          case InsertionCase.Left: {
            this.tree.insert_left(p, child);
            break;
          }
          case InsertionCase.Right: {
            this.tree.insert_right(p, child);
            break;
          }
          case InsertionCase.Split: {
            const y = this.tree.split_node(p, i, 0);
            this.tree.insert_left(y, child);
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
   * buf.delete(5, 11);
   *
   * assertEquals(buf.read(0), "Lorem");
   * ```
   */
  delete(start: Position, end?: Position): void {
    const i0 = this.#index(start);

    if (typeof i0 === "number") {
      const first = this.tree.find_node(i0);

      if (first) {
        const i1 = (end ? this.#index(end) : undefined) ??
          Number.MAX_SAFE_INTEGER;

        const { node, offset } = first;
        const count = i1 - i0;
        const offset2 = offset + count;

        if (offset2 === node.slice_len) {
          if (offset === 0) {
            this.tree.delete_node(node);
          } else {
            this.tree.trim_node_end(node, count);
            bubble(node);
          }
        } else if (offset2 < node.slice_len) {
          if (offset === 0) {
            this.tree.trim_node_start(node, count);
            bubble(node);
          } else {
            this.tree.split_node(node, offset, count);
          }
        } else {
          let x = node;
          let i = 0;

          if (offset !== 0) {
            x = this.tree.split_node(node, offset, 0);
          }

          const last = this.tree.find_node(i1);
          if (last && last.offset !== 0) {
            this.tree.split_node(last.node, last.offset, 0);
          }

          while ((x !== NIL) && (i < count)) {
            i += x.slice_len;

            const next = successor(x);

            this.tree.delete_node(x);

            x = next;
          }
        }
      }
    }
  }

  #index(pos: Position): number | undefined {
    let i: number | undefined;

    if (typeof pos === "number") {
      i = pos;
    } else {
      let ln = pos[0];
      if (ln < 0) {
        ln = Math.max(this.line_count + ln, 0);
      }

      switch (ln) {
        case 0:
          i = 0;
          break;
        default:
          i = this.tree.find_eol(ln - 1);
          break;
      }

      if (typeof i === "number") {
        i += pos[1];
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

  #create_node(text: string): Node {
    const buf = new Buffer(text);
    const buf_index = this.tree.bufs.push(buf) - 1;

    return create_node(buf_index, 0, buf.len, 0, buf.eol_starts.length);
  }
}
