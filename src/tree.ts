import { Buffer } from "./buffer.ts";
import { create_node, NIL, type Node } from "./node.ts";
import { successor } from "./querying.ts";

export class Tree {
  root = NIL;
  bufs: Buffer[] = [];

  create_node(text: string): Node {
    const buf = new Buffer(text);
    const buf_index = this.bufs.push(buf) - 1;

    return create_node(buf_index, 0, buf.len, 0, buf.eol_starts.length);
  }

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

  node_growable(x: Node): boolean {
    const buf = this.bufs[x.buf_index]!;

    return (buf.len < 100) && (x.slice_start + x.slice_len === buf.len);
  }

  grow_node(x: Node, text: string): void {
    this.bufs[x.buf_index]!.append(text);

    this.resize_node(x, x.slice_len + text.length);
  }

  resize_node(x: Node, len: number): void {
    const buf = this.bufs[x.buf_index]!;

    x.slice_len = len;

    const eols_end = buf.find_eol(
      x.slice_eols_start,
      x.slice_start + x.slice_len,
    );

    x.slice_eols_len = eols_end - x.slice_eols_start;
  }
}
