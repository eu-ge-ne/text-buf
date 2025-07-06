import type { Tree } from "./tree.ts";

export const NIL = { red: false, total_len: 0, total_eols_len: 0 } as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export interface Node {
  red: boolean;
  p: Node;
  left: Node;
  right: Node;
  total_len: number;
  total_eols_len: number;
  buf_index: number;
  slice_start: number;
  slice_len: number;
  slice_eols_start: number;
  slice_eols_len: number;
}

export function create_node(
  buf_index: number,
  slice_start: number,
  slice_len: number,
  slice_eols_start: number,
  slice_eols_len: number,
): Node {
  return {
    red: true,
    p: NIL,
    left: NIL,
    right: NIL,
    total_len: slice_len,
    total_eols_len: slice_eols_len,
    buf_index,
    slice_start,
    slice_len,
    slice_eols_start,
    slice_eols_len,
  };
}

export function trim_node_start(tree: Tree, x: Node, n: number): void {
  const buf = tree.bufs[x.buf_index]!;

  x.slice_start += n;
  x.slice_len -= n;
  x.slice_eols_start = buf.find_eol(x.slice_eols_start, x.slice_start);

  const eols_end = buf.find_eol(
    x.slice_eols_start,
    x.slice_start + x.slice_len,
  );

  x.slice_eols_len = eols_end - x.slice_eols_start;
}

export function trim_node_end(tree: Tree, x: Node, n: number): void {
  tree.resize_node(x, x.slice_len - n);
}

export function split_node(
  tree: Tree,
  x: Node,
  index: number,
  gap: number,
): Node {
  const buf = tree.bufs[x.buf_index]!;

  const start = x.slice_start + index + gap;
  const len = x.slice_len - index - gap;

  tree.resize_node(x, index);

  const eols_start = buf.find_eol(
    x.slice_eols_start + x.slice_eols_len,
    start,
  );
  const eols_end = buf.find_eol(eols_start, start + len);
  const eols_len = eols_end - eols_start;

  return create_node(x.buf_index, start, len, eols_start, eols_len);
}

export function bubble(x: Node): void {
  while (x !== NIL) {
    x.total_len = x.left.total_len + x.slice_len + x.right.total_len;

    x.total_eols_len = x.left.total_eols_len + x.slice_eols_len +
      x.right.total_eols_len;

    x = x.p;
  }
}
