import { NIL, type Node } from "./node.ts";

export interface Tree {
  root: Node;
}

export function bubble(x: Node): void {
  while (x !== NIL) {
    x.total_len = x.left.total_len + x.slice_len + x.right.total_len;

    x.total_eols_len = x.left.total_eols_len + x.slice_eols_len +
      x.right.total_eols_len;

    x = x.p;
  }
}
