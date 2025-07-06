import type { Buffer } from "./buffer.ts";
import {
  bubble,
  create_node,
  minimum,
  NIL,
  type Node,
  successor,
} from "./node.ts";

export class Tree {
  root = NIL;
  bufs: Buffer[] = [];

  find_node(index: number): { node: Node; offset: number } | undefined {
    let x = this.root;

    while (x !== NIL) {
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

  find_eol(eol_index: number): number | undefined {
    let x = this.root;

    for (let i = 0; x !== NIL;) {
      if (eol_index < x.left.total_eols_len) {
        x = x.left;
      } else {
        eol_index -= x.left.total_eols_len;
        i += x.left.total_len;

        if (eol_index < x.slice_eols_len) {
          const buf = this.bufs[x.buf_index]!;
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

  *read(x: Node, offset: number, n: number): Generator<string> {
    while ((x !== NIL) && (n > 0)) {
      const count = Math.min(x.slice_len - offset, n);

      yield this.bufs[x.buf_index]!.read(x.slice_start + offset, count);

      x = successor(x);
      offset = 0;
      n -= count;
    }
  }

  split_node(x: Node, index: number, gap: number): Node {
    const buf = this.bufs[x.buf_index]!;

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
    this.insert_after(x, node);

    return node;
  }

  node_growable(x: Node): boolean {
    const buf = this.bufs[x.buf_index]!;

    return (buf.len < 100) && (x.slice_start + x.slice_len === buf.len);
  }

  grow_node(x: Node, text: string): void {
    this.bufs[x.buf_index]!.append(text);

    this.#resize_node(x, x.slice_len + text.length);
  }

  trim_node_start(x: Node, n: number): void {
    const buf = this.bufs[x.buf_index]!;

    x.slice_start += n;
    x.slice_len -= n;
    x.slice_eols_start = buf.find_eol(x.slice_eols_start, x.slice_start);

    const eols_end = buf.find_eol(
      x.slice_eols_start,
      x.slice_start + x.slice_len,
    );

    x.slice_eols_len = eols_end - x.slice_eols_start;
  }

  trim_node_end(x: Node, n: number): void {
    this.#resize_node(x, x.slice_len - n);
  }

  #resize_node(x: Node, len: number): void {
    const buf = this.bufs[x.buf_index]!;

    x.slice_len = len;

    const eols_end = buf.find_eol(
      x.slice_eols_start,
      x.slice_start + x.slice_len,
    );

    x.slice_eols_len = eols_end - x.slice_eols_start;
  }

  left_rotate(x: Node): void {
    const y = x.right;

    x.right = y.left;
    if (y.left !== NIL) {
      y.left.p = x;
    }

    y.p = x.p;

    if (x.p === NIL) {
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

  right_rotate(y: Node): void {
    const x = y.left;

    y.left = x.right;
    if (x.right !== NIL) {
      x.right.p = y;
    }

    x.p = y.p;

    if (y.p === NIL) {
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

  insert_after(p: Node, z: Node): void {
    if (p.right === NIL) {
      this.insert_right(p, z);
    } else {
      this.insert_left(minimum(p.right), z);
    }
  }

  insert_left(p: Node, z: Node): void {
    p.left = z;
    z.p = p;

    bubble(z);
    this.insert_fixup(z);
  }

  insert_right(p: Node, z: Node): void {
    p.right = z;
    z.p = p;

    bubble(z);
    this.insert_fixup(z);
  }

  insert_fixup(z: Node): void {
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
            this.left_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.right_rotate(z.p.p);
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
            this.right_rotate(z);
          }
          z.p.red = false;
          z.p.p.red = true;
          this.left_rotate(z.p.p);
        }
      }
    }

    this.root.red = false;
  }

  delete_node(z: Node): void {
    let y = z;
    let y_original_color = y.red;
    let x: Node;

    if (z.left === NIL) {
      x = z.right;

      this.transplant(z, z.right);
      bubble(z.right.p);
    } else if (z.right === NIL) {
      x = z.left;

      this.transplant(z, z.left);
      bubble(z.left.p);
    } else {
      y = minimum(z.right);

      y_original_color = y.red;
      x = y.right;

      if (y !== z.right) {
        this.transplant(y, y.right);
        bubble(y.right.p);

        y.right = z.right;
        y.right.p = y;
      } else {
        x.p = y;
      }

      this.transplant(z, y);

      y.left = z.left;
      y.left.p = y;
      y.red = z.red;

      bubble(y);
    }

    if (!y_original_color) {
      this.delete_fixup(x);
    }
  }

  transplant(u: Node, v: Node): void {
    if (u.p === NIL) {
      this.root = v;
    } else if (u === u.p.left) {
      u.p.left = v;
    } else {
      u.p.right = v;
    }

    v.p = u.p;
  }

  delete_fixup(x: Node): void {
    while (x !== this.root && !x.red) {
      if (x === x.p.left) {
        let w = x.p.right;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.left_rotate(x.p);
          w = x.p.right;
        }

        if (!w.left.red && !w.right.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.right.red) {
            w.left.red = false;
            w.red = true;
            this.right_rotate(w);
            w = x.p.right;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.right.red = false;
          this.left_rotate(x.p);
          x = this.root;
        }
      } else {
        let w = x.p.left;

        if (w.red) {
          w.red = false;
          x.p.red = true;
          this.right_rotate(x.p);
          w = x.p.left;
        }

        if (!w.right.red && !w.left.red) {
          w.red = true;
          x = x.p;
        } else {
          if (!w.left.red) {
            w.right.red = false;
            w.red = true;
            this.left_rotate(w);
            w = x.p.left;
          }

          w.red = x.p.red;
          x.p.red = false;
          w.left.red = false;
          this.right_rotate(x.p);
          x = this.root;
        }
      }
    }

    x.red = false;
  }
}
