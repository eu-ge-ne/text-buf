import { Buffer } from "./buffer.ts";
import { bubble, create_node, maximum, minimum, NIL, type Node, successor } from "./node.ts";
import type { Position } from "./position.ts";

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
  root = NIL;

  #bufs: Buffer[] = [];

  /**
   * Creates instances of `TextBuf` interpreting text characters as `UTF-16 code units`. Visit [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters) for more details. Accepts optional initial text.
   *
   * @param `text` Initial text.
   * @returns `TextBuf` instance.
   */
  constructor(text?: string) {
    if (text && text.length > 0) {
      this.root = this.#create_node(text);
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
    return this.root.total_len;
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
    return this.root.total_len === 0 ? 0 : this.root.total_eols_len + 1;
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
   * assertEquals(buf.read(0).toArray().join(""), "Lorem\nipsum");
   * assertEquals(buf.read(6).toArray().join(""), "ipsum");
   * assertEquals(buf.read([0, 0], [1, 0]).toArray().join(""), "Lorem\n");
   * assertEquals(buf.read([1, 0], [2, 0]).toArray().join(""), "ipsum");
   * ```
   */
  *read(start: Position, end?: Position): Generator<string> {
    const start_i = this.#index(start);
    if (typeof start_i === "undefined") {
      return;
    }

    const first = this.#find(start_i);
    if (!first) {
      return;
    }

    const { node, offset } = first;

    const end_i = (end ? this.#index(end) : undefined) ??
      Number.MAX_SAFE_INTEGER;
    const n = end_i - start_i;

    yield* this.#read(node, offset, n);
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
   * assertEquals(buf.read(0).toArray().join(""), "Lorem ipsum");
   * ```
   */
  insert(pos: Position, text: string): void {
    let i = this.#index(pos);

    if (typeof i === "number") {
      let p = NIL;
      let insert_case = InsertionCase.Root;

      for (let x = this.root; !x.nil;) {
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

      if (insert_case === InsertionCase.Right && this.#node_growable(p)) {
        this.#grow_node(p, text);

        bubble(p);
      } else {
        const child = this.#create_node(text);

        switch (insert_case) {
          case InsertionCase.Root: {
            this.root = child;
            this.root.red = false;
            break;
          }
          case InsertionCase.Left: {
            this.#insert_left(p, child);
            break;
          }
          case InsertionCase.Right: {
            this.#insert_right(p, child);
            break;
          }
          case InsertionCase.Split: {
            const y = this.#split_node(p, i, 0);
            this.#insert_before(y, child);
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
   * assertEquals(buf.read(0).toArray().join(""), "Lorem");
   * ```
   */
  delete(start: Position, end?: Position): void {
    const i0 = this.#index(start);

    if (typeof i0 === "number") {
      const first = this.#find(i0);

      if (first) {
        const i1 = (end ? this.#index(end) : undefined) ??
          Number.MAX_SAFE_INTEGER;

        const { node, offset } = first;
        const count = i1 - i0;
        const offset2 = offset + count;

        if (offset2 === node.slice_len) {
          if (offset === 0) {
            this.#delete(node);
          } else {
            this.#trim_node_end(node, count);
            bubble(node);
          }
        } else if (offset2 < node.slice_len) {
          if (offset === 0) {
            this.#trim_node_start(node, count);
            bubble(node);
          } else {
            this.#split_node(node, offset, count);
          }
        } else {
          let x = node;
          let i = 0;

          if (offset !== 0) {
            x = this.#split_node(node, offset, 0);
          }

          const last = this.#find(i1);
          if (last && last.offset !== 0) {
            this.#split_node(last.node, last.offset, 0);
          }

          while (!x.nil && (i < count)) {
            i += x.slice_len;

            const next = successor(x);

            this.#delete(x);

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
          i = this.#find_eol(ln - 1);
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

  #find(index: number): { node: Node; offset: number } | undefined {
    let x = this.root;

    while (!x.nil) {
      if (index < x.left.total_len) {
        x = x.left;
      } else {
        index -= x.left.total_len;

        if (index < x.slice_len) {
          return { node: x, offset: index };
        } else {
          index -= x.slice_len;

          x = x.right;
        }
      }
    }
  }

  #find_eol(eol_index: number): number | undefined {
    let x = this.root;

    for (let i = 0; !x.nil;) {
      if (eol_index < x.left.total_eols_len) {
        x = x.left;
      } else {
        eol_index -= x.left.total_eols_len;
        i += x.left.total_len;

        if (eol_index < x.slice_eols_len) {
          const buf = this.#bufs[x.buf_index]!;

          return i + buf.eol_ends[x.slice_eols_start + eol_index]! -
            x.slice_start;
        } else {
          eol_index -= x.slice_eols_len;
          i += x.slice_len;

          x = x.right;
        }
      }
    }
  }

  *#read(x: Node, offset: number, n: number): Generator<string> {
    while (!x.nil && (n > 0)) {
      const count = Math.min(x.slice_len - offset, n);

      yield this.#bufs[x.buf_index]!.read(x.slice_start + offset, count);

      x = successor(x);
      offset = 0;
      n -= count;
    }
  }

  #insert_before(p: Node, z: Node): void {
    if (p.left.nil) {
      this.#insert_left(p, z);
    } else {
      this.#insert_right(maximum(p.left), z);
    }
  }

  #insert_after(p: Node, z: Node): void {
    if (p.right.nil) {
      this.#insert_right(p, z);
    } else {
      this.#insert_left(minimum(p.right), z);
    }
  }

  #insert_left(p: Node, z: Node): void {
    p.left = z;
    z.p = p;

    bubble(z);

    this.#insert_fixup(z);
  }

  #insert_right(p: Node, z: Node): void {
    p.right = z;
    z.p = p;

    bubble(z);

    this.#insert_fixup(z);
  }

  #insert_fixup(z: Node): void {
    while (z.p.red) {
      if (z.p === z.p.p.left) {
        const y = z.p.p.right;
        if (y.red) {
          z.p.red = false;
          y.red = false;
          z.p.p.red = true;
          z = z.p.p;
        } else {
          if (z === z.p.right) {
            z = z.p;
            this.#left_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#right_rotate(z.p.p);
        }
      } else {
        const y = z.p.p.left;
        if (y.red) {
          z.p.red = false;
          y.red = false;
          z.p.p.red = true;
          z = z.p.p;
        } else {
          if (z === z.p.left) {
            z = z.p;
            this.#right_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.#left_rotate(z.p.p);
        }
      }
    }

    this.root.red = false;
  }

  #delete(z: Node): void {
    let y = z;
    let y_original_color = y.red;
    let x: Node;

    if (z.left.nil) {
      x = z.right;

      this.#transplant(z, z.right);
      bubble(z.right.p);
    } else if (z.right.nil) {
      x = z.left;

      this.#transplant(z, z.left);
      bubble(z.left.p);
    } else {
      y = minimum(z.right);

      y_original_color = y.red;
      x = y.right;

      if (y !== z.right) {
        this.#transplant(y, y.right);
        bubble(y.right.p);

        y.right = z.right;
        y.right.p = y;
      } else {
        x.p = y;
      }

      this.#transplant(z, y);

      y.left = z.left;
      y.left.p = y;
      y.red = z.red;

      bubble(y);
    }

    if (!y_original_color) {
      this.#delete_fixup(x);
    }
  }

  #delete_fixup(x: Node): void {
    while (x !== this.root && !x.red) {
      if (x === x.p.left) {
        let w = x.p.right;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#left_rotate(x.p);
          w = x.p.right;
        }

        if (!w.left.red && !w.right.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.right.red) {
            w.left.red = false;
            w.red = true;
            this.#right_rotate(w);
            w = x.p.right;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.right.red = false;
          this.#left_rotate(x.p);
          x = this.root;
        }
      } else {
        let w = x.p.left;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.#right_rotate(x.p);
          w = x.p.left;
        }

        if (!w.right.red && !w.left.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.left.red) {
            w.right.red = false;
            w.red = true;
            this.#left_rotate(w);
            w = x.p.left;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.left.red = false;
          this.#right_rotate(x.p);
          x = this.root;
        }
      }
    }

    x.red = false;
  }

  #left_rotate(x: Node): void {
    const y = x.right;

    x.right = y.left;
    if (!y.left.nil) {
      y.left.p = x;
    }

    y.p = x.p;

    if (x.p.nil) {
      this.root = y;
    } else if (x === x.p.left) {
      x.p.left = y;
    } else {
      x.p.right = y;
    }

    y.left = x;
    x.p = y;

    bubble(x);
  }

  #right_rotate(y: Node): void {
    const x = y.left;

    y.left = x.right;
    if (!x.right.nil) {
      x.right.p = y;
    }

    x.p = y.p;

    if (y.p.nil) {
      this.root = x;
    } else if (y === y.p.left) {
      y.p.left = x;
    } else {
      y.p.right = x;
    }

    x.right = y;
    y.p = x;

    bubble(y);
  }

  #transplant(u: Node, v: Node): void {
    if (u.p.nil) {
      this.root = v;
    } else if (u === u.p.left) {
      u.p.left = v;
    } else {
      u.p.right = v;
    }

    v.p = u.p;
  }

  #create_node(text: string): Node {
    const buf = new Buffer(text);
    const buf_index = this.#bufs.push(buf) - 1;

    return create_node(buf_index, 0, buf.len, 0, buf.eol_starts.length);
  }

  #split_node(x: Node, index: number, gap: number): Node {
    const buf = this.#bufs[x.buf_index]!;

    const start = x.slice_start + index + gap;
    const len = x.slice_len - index - gap;

    this.#resize_node(x, index);
    bubble(x);

    const eols_start = buf.find_eol(
      x.slice_eols_start + x.slice_eols_len,
      start,
    );
    const eols_end = buf.find_eol(eols_start, start + len);
    const eols_len = eols_end - eols_start;

    const node = create_node(x.buf_index, start, len, eols_start, eols_len);
    this.#insert_after(x, node);

    return node;
  }

  #node_growable(x: Node): boolean {
    const buf = this.#bufs[x.buf_index]!;

    return (buf.len < 100) && (x.slice_start + x.slice_len === buf.len);
  }

  #grow_node(x: Node, text: string): void {
    this.#bufs[x.buf_index]!.append(text);

    this.#resize_node(x, x.slice_len + text.length);
  }

  #trim_node_start(x: Node, n: number): void {
    const buf = this.#bufs[x.buf_index]!;

    x.slice_start += n;
    x.slice_len -= n;
    x.slice_eols_start = buf.find_eol(x.slice_eols_start, x.slice_start);

    const eols_end = buf.find_eol(
      x.slice_eols_start,
      x.slice_start + x.slice_len,
    );

    x.slice_eols_len = eols_end - x.slice_eols_start;
  }

  #trim_node_end(x: Node, n: number): void {
    this.#resize_node(x, x.slice_len - n);
  }

  #resize_node(x: Node, len: number): void {
    x.slice_len = len;

    const buf = this.#bufs[x.buf_index]!;
    const eols_end = buf.find_eol(
      x.slice_eols_start,
      x.slice_start + x.slice_len,
    );

    x.slice_eols_len = eols_end - x.slice_eols_start;
  }
}
