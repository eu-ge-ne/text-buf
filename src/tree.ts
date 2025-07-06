import { Buffer } from "./buffer.ts";
import { create_node, NIL, type Node } from "./node.ts";

export class Tree {
  root = NIL;
  bufs: Buffer[] = [];

  create_node(text: string): Node {
    const buf = new Buffer(text);
    const buf_index = this.bufs.push(buf) - 1;

    return create_node(buf_index, 0, buf.len, 0, buf.eol_starts.length);
  }

  find_node(
    index: number,
  ): { node: Node; offset: number } | undefined {
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
}
