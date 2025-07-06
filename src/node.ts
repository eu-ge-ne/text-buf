import type { Buffer } from "./buffer.ts";
import { successor } from "./querying.ts";

export interface Node {
  red: boolean;
  p: Node;
  left: Node;
  right: Node;
  total_len: number;
  total_eols_len: number;
  buf: Buffer;
  slice_start: number;
  slice_len: number;
  slice_eols_start: number;
  slice_eols_len: number;
}

export const NIL = { red: false, total_len: 0, total_eols_len: 0 } as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

function new_node(
  buf: Buffer,
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
    buf,
    slice_start,
    slice_len,
    slice_eols_start,
    slice_eols_len,
  };
}

export function node_from_buf(buf: Buffer): Node {
  return new_node(buf, 0, buf.len, 0, buf.eol_starts.length);
}

export function* read(
  node: Node,
  offset: number,
  n: number,
): Generator<string> {
  while ((node !== NIL) && (n > 0)) {
    const count = Math.min(node.slice_len - offset, n);

    yield node.buf.read(node.slice_start + offset, count);

    node = successor(node);
    offset = 0;
    n -= count;
  }
}

export function node_growable(x: Node): boolean {
  return (x.buf.len < 100) && (x.slice_start + x.slice_len === x.buf.len);
}

export function grow_node(x: Node, text: string): void {
  x.buf.append(text);

  resize_node(x, x.slice_len + text.length);
}

export function trim_node_start(x: Node, n: number): void {
  x.slice_start += n;
  x.slice_len -= n;
  x.slice_eols_start = x.buf.find_eol(x.slice_eols_start, x.slice_start);

  const eols_end = x.buf.find_eol(
    x.slice_eols_start,
    x.slice_start + x.slice_len,
  );

  x.slice_eols_len = eols_end - x.slice_eols_start;
}

export function trim_node_end(x: Node, n: number): void {
  resize_node(x, x.slice_len - n);
}

export function split_node(x: Node, index: number, gap: number): Node {
  const start = x.slice_start + index + gap;
  const len = x.slice_len - index - gap;

  resize_node(x, index);

  const eols_start = x.buf.find_eol(
    x.slice_eols_start + x.slice_eols_len,
    start,
  );
  const eols_end = x.buf.find_eol(eols_start, start + len);
  const eols_len = eols_end - eols_start;

  return new_node(x.buf, start, len, eols_start, eols_len);
}

function resize_node(x: Node, len: number): void {
  x.slice_len = len;

  const eols_end = x.buf.find_eol(
    x.slice_eols_start,
    x.slice_start + x.slice_len,
  );

  x.slice_eols_len = eols_end - x.slice_eols_start;
}
