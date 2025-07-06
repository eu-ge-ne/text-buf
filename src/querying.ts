import { NIL, type Node } from "./node.ts";
import type { Tree } from "./tree.ts";

export function find_eol(
  tree: Tree,
  eol_index: number,
): number | undefined {
  let x = tree.root;

  for (let i = 0; x !== NIL;) {
    if (eol_index < x.left.total_eols_len) {
      x = x.left;
    } else {
      eol_index -= x.left.total_eols_len;
      i += x.left.total_len;

      if (eol_index < x.slice_eols_len) {
        return i +
          tree.bufs[x.buf_index]!.eol_ends[x.slice_eols_start + eol_index]! -
          x.slice_start;
      } else {
        eol_index -= x.slice_eols_len;
        i += x.slice_len;

        x = x.right;
      }
    }
  }
}

export function minimum(x: Node): Node {
  while (x.left !== NIL) {
    x = x.left;
  }

  return x;
}

export function successor(x: Node): Node {
  if (x.right !== NIL) {
    return minimum(x.right);
  } else {
    let y = x.p;

    while (y !== NIL && x === y.right) {
      x = y;
      y = y.p;
    }

    return y;
  }
}
