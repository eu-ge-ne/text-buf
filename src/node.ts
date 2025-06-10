import { successor } from "./querying.ts";
import { type Slice, slice_from_text } from "./slice.ts";

export interface Tree {
  root: Node;
}

export interface Node {
  red: boolean;
  p: Node;
  left: Node;
  right: Node;
  readonly slice: Slice;
  len: number;
  eols_len: number;
}

export const NIL = { red: false, len: 0, eols_len: 0 } as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export function new_node(slice: Slice): Node {
  return {
    red: true,
    p: NIL,
    left: NIL,
    right: NIL,
    slice,
    len: slice.len,
    eols_len: slice.eols_len,
  };
}

export function node_from_text(text: string): Node {
  return new_node(slice_from_text(text));
}

export function* read(
  node: Node,
  offset: number,
  n: number,
): Generator<string> {
  while ((node !== NIL) && (n > 0)) {
    const count = Math.min(node.slice.len - offset, n);

    yield node.slice.buf.read(node.slice.start + offset, count);

    node = successor(node);
    offset = 0;
    n -= count;
  }
}

export function bubble_update(x: Node): void {
  while (x !== NIL) {
    x.len = x.left.len + x.slice.len + x.right.len;
    x.eols_len = x.left.eols_len + x.slice.eols_len + x.right.eols_len;
    x = x.p;
  }
}
