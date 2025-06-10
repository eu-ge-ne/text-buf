import { bubble_update, NIL, type Node, type Tree } from "./node.ts";
import { minimum } from "./querying.ts";
import { left_rotate, right_rotate } from "./rotation.ts";

export const enum InsertionCase {
  Root,
  Left,
  Right,
  Split,
}

export function insert_after(tree: Tree, p: Node, z: Node): void {
  if (p.right === NIL) {
    insert_right(tree, p, z);
  } else {
    insert_left(tree, minimum(p.right), z);
  }
}

export function insert_left(tree: Tree, p: Node, z: Node): void {
  p.left = z;
  z.p = p;

  bubble_update(z);
  insert_fixup(tree, z);
}

export function insert_right(tree: Tree, p: Node, z: Node): void {
  p.right = z;
  z.p = p;

  bubble_update(z);
  insert_fixup(tree, z);
}

function insert_fixup(tree: Tree, z: Node): void {
  while (z.p.red) {
    if (z.p === z.p.p.left) {
      const y = z.p.p.right;
      if (y.red) {
        z.p.red = false;
        y.red = false;
        z.p.p.red = true;
        z = z.p.p;
      } else {
        if (z === z.p.right) {
          z = z.p;
          left_rotate(tree, z);
        }
        z.p.red = false;
        z.p.p.red = true;
        right_rotate(tree, z.p.p);
      }
    } else {
      const y = z.p.p.left;
      if (y.red) {
        z.p.red = false;
        y.red = false;
        z.p.p.red = true;
        z = z.p.p;
      } else {
        if (z === z.p.left) {
          z = z.p;
          right_rotate(tree, z);
        }
        z.p.red = false;
        z.p.p.red = true;
        left_rotate(tree, z.p.p);
      }
    }
  }

  tree.root.red = false;
}
