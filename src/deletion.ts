import { bubble_update, NIL, type Node, type Tree } from "./node.ts";
import { minimum } from "./querying.ts";
import { left_rotate, right_rotate } from "./rotation.ts";

export function delete_node(tree: Tree, z: Node): void {
  let y = z;
  let y_original_color = y.red;
  let x: Node;

  if (z.left === NIL) {
    x = z.right;

    transplant(tree, z, z.right);
    bubble_update(z.right.p);
  } else if (z.right === NIL) {
    x = z.left;

    transplant(tree, z, z.left);
    bubble_update(z.left.p);
  } else {
    y = minimum(z.right);

    y_original_color = y.red;
    x = y.right;

    if (y !== z.right) {
      transplant(tree, y, y.right);
      bubble_update(y.right.p);

      y.right = z.right;
      y.right.p = y;
    } else {
      x.p = y;
    }

    transplant(tree, z, y);

    y.left = z.left;
    y.left.p = y;
    y.red = z.red;

    bubble_update(y);
  }

  if (!y_original_color) {
    delete_fixup(tree, x);
  }
}

function transplant(tree: Tree, u: Node, v: Node): void {
  if (u.p === NIL) {
    tree.root = v;
  } else if (u === u.p.left) {
    u.p.left = v;
  } else {
    u.p.right = v;
  }

  v.p = u.p;
}

function delete_fixup(tree: Tree, x: Node): void {
  while (x !== tree.root && !x.red) {
    if (x === x.p.left) {
      let w = x.p.right;

      if (w.red) {
        w.red = false;
        x.p.red = true;
        left_rotate(tree, x.p);
        w = x.p.right;
      }

      if (!w.left.red && !w.right.red) {
        w.red = true;
        x = x.p;
      } else {
        if (!w.right.red) {
          w.left.red = false;
          w.red = true;
          right_rotate(tree, w);
          w = x.p.right;
        }

        w.red = x.p.red;
        x.p.red = false;
        w.right.red = false;
        left_rotate(tree, x.p);
        x = tree.root;
      }
    } else {
      let w = x.p.left;

      if (w.red) {
        w.red = false;
        x.p.red = true;
        right_rotate(tree, x.p);
        w = x.p.left;
      }

      if (!w.right.red && !w.left.red) {
        w.red = true;
        x = x.p;
      } else {
        if (!w.left.red) {
          w.right.red = false;
          w.red = true;
          left_rotate(tree, w);
          w = x.p.left;
        }

        w.red = x.p.red;
        x.p.red = false;
        w.left.red = false;
        right_rotate(tree, x.p);
        x = tree.root;
      }
    }
  }

  x.red = false;
}
