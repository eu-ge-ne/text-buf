import { bubble_update, NIL, type Node, type Tree } from "./node.ts";

export function left_rotate(tree: Tree, x: Node): void {
  const y = x.right;

  x.right = y.left;
  if (y.left !== NIL) {
    y.left.p = x;
  }

  y.p = x.p;

  if (x.p === NIL) {
    tree.root = y;
  } else if (x === x.p.left) {
    x.p.left = y;
  } else {
    x.p.right = y;
  }

  y.left = x;
  x.p = y;

  bubble_update(x);
}

export function right_rotate(tree: Tree, y: Node): void {
  const x = y.left;

  y.left = x.right;
  if (x.right !== NIL) {
    x.right.p = y;
  }

  x.p = y.p;

  if (y.p === NIL) {
    tree.root = x;
  } else if (y === y.p.left) {
    y.p.left = x;
  } else {
    y.p.right = x;
  }

  x.right = y;
  y.p = x;

  bubble_update(y);
}
