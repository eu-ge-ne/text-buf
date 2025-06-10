import { NIL, type Node } from "./node.ts";

export function find_node(
  x: Node,
  index: number,
): { node: Node; offset: number } | undefined {
  while (x !== NIL) {
    if (index < x.left.len) {
      x = x.left;
    } else {
      index -= x.left.len;

      if (index < x.slice.len) {
        return { node: x, offset: index };
      } else {
        index -= x.slice.len;

        x = x.right;
      }
    }
  }
}

export function find_eol(x: Node, eol_index: number): number | undefined {
  for (let i = 0; x !== NIL;) {
    if (eol_index < x.left.eols_len) {
      x = x.left;
    } else {
      eol_index -= x.left.eols_len;
      i += x.left.len;

      if (eol_index < x.slice.eols_len) {
        return i + x.slice.buf.eol_ends[x.slice.eols_start + eol_index]! -
          x.slice.start;
      } else {
        eol_index -= x.slice.eols_len;
        i += x.slice.len;

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
