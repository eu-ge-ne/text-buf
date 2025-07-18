export const NIL = {
  nil: true,
  red: false,
  total_len: 0,
  total_eols_len: 0,
} as Node;

NIL.p = NIL;
NIL.left = NIL;
NIL.right = NIL;

export interface Node {
  nil: boolean;
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
    nil: false,
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

export function bubble(x: Node): void {
  while (!x.nil) {
    x.total_len = x.left.total_len + x.slice_len + x.right.total_len;

    x.total_eols_len = x.left.total_eols_len + x.slice_eols_len +
      x.right.total_eols_len;

    x = x.p;
  }
}

export function minimum(x: Node): Node {
  while (!x.left.nil) {
    x = x.left;
  }

  return x;
}

export function maximum(x: Node): Node {
  while (!x.right.nil) {
    x = x.right;
  }

  return x;
}

export function successor(x: Node): Node {
  if (!x.right.nil) {
    return minimum(x.right);
  } else {
    let y = x.p;

    while (!y.nil && x === y.right) {
      x = y;
      y = y.p;
    }

    return y;
  }
}
