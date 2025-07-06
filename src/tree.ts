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
}
