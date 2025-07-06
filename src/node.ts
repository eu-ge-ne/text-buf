import { successor } from "./querying.ts";
import { type Slice, slice_from_text } from "./slice.ts";

export interface Node {
  red: boolean;
  p: Node;
  left: Node;
  right: Node;
  total_len: number;
  total_eols_len: number;
  readonly slice: Slice;
}

export const NIL = { red: false, total_len: 0, total_eols_len: 0 } as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export function new_node(slice: Slice): Node {
  return {
    red: true,
    p: NIL,
    left: NIL,
    right: NIL,
    total_len: slice.len,
    total_eols_len: slice.eols_len,
    slice,
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

export function node_growable(x: Node): boolean {
  return (x.slice.buf.len < 100) &&
    (x.slice.start + x.slice.len === x.slice.buf.len);
}
