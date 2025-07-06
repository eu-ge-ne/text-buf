import { successor } from "./querying.ts";
import { new_slice, type Slice, slice_from_text } from "./slice.ts";

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

export function grow_node(x: Node, text: string): void {
  x.slice.buf.append(text);

  resize_slice(x.slice, x.slice.len + text.length);
}

export function trim_node_start(x: Node, n: number): void {
  x.slice.start += n;
  x.slice.len -= n;
  x.slice.eols_start = x.slice.buf.find_eol(x.slice.eols_start, x.slice.start);

  const eols_end = x.slice.buf.find_eol(
    x.slice.eols_start,
    x.slice.start + x.slice.len,
  );

  x.slice.eols_len = eols_end - x.slice.eols_start;
}

export function trim_node_end(x: Node, n: number): void {
  resize_slice(x.slice, x.slice.len - n);
}

export function split_node(x: Node, index: number, gap: number): Node {
  const start = x.slice.start + index + gap;
  const len = x.slice.len - index - gap;

  resize_slice(x.slice, index);

  const eols_start = x.slice.buf.find_eol(
    x.slice.eols_start + x.slice.eols_len,
    start,
  );
  const eols_end = x.slice.buf.find_eol(eols_start, start + len);
  const eols_len = eols_end - eols_start;

  const slice = new_slice(x.slice.buf, start, len, eols_start, eols_len);

  return new_node(slice);
}

function resize_slice(x: Slice, len: number): void {
  x.len = len;
  const eols_end = x.buf.find_eol(x.eols_start, x.start + x.len);
  x.eols_len = eols_end - x.eols_start;
}
