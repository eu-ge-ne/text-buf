import { NIL, type Node } from "./node.ts";

export interface Tree {
  root: Node;
}

export function bubble(x: Node): void {
  while (x !== NIL) {
    x.len = x.left.len + x.slice.len + x.right.len;
    x.eols_len = x.left.eols_len + x.slice.eols_len + x.right.eols_len;
    x = x.p;
  }
}
