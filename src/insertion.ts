import { bubble, minimum, NIL, type Node } from "./node.ts";
import type { Tree } from "./tree.ts";

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

  bubble(z);
  insert_fixup(tree, z);
}

export function insert_right(tree: Tree, p: Node, z: Node): void {
  p.right = z;
  z.p = p;

  bubble(z);
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
          tree.left_rotate(z);
        }
        z.p.red = false;
        z.p.p.red = true;
        tree.right_rotate(z.p.p);
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
          tree.right_rotate(z);
        }
        z.p.red = false;
        z.p.p.red = true;
        tree.left_rotate(z.p.p);
      }
    }
  }

  tree.root.red = false;
}
