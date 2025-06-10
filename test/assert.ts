import { assert } from "@std/assert";

import { NIL, type Node, type Tree } from "../src/node.ts";

export function assert_tree(tree: Tree): void {
  // 1. Every node is either red or black.
  // 2. The root is black.
  assert(!tree.root.red);

  assert_node(tree.root);

  // 5. For each node, all simple paths from the node to descendant leaves
  // contain the same number of black nodes.
  const leaf_parents = new Set<Node>();
  collect_leaf_parents(tree.root, leaf_parents);

  const heights = Array.from(leaf_parents).map(black_height);
  for (const height of heights) {
    assert(Math.abs(heights[0]! - height) === 0);
  }
}

function assert_node(x: Node): void {
  // 3. Every leaf (NIL) is black.
  if (x === NIL) {
    assert(!x.red);
  } else {
    // 4. If a node is red, then both its children are black.
    if (x.red) {
      assert(!x.left.red && !x.right.red);
    }

    assert_node(x.left);
    assert_node(x.right);

    // 6. slice.len > 0
    assert(x.slice.len > 0);
  }
}

function collect_leaf_parents(x: Node, leaf_parents: Set<Node>): void {
  if (x !== NIL) {
    if (x.left === NIL || x.right === NIL) {
      leaf_parents.add(x);
    }

    collect_leaf_parents(x.left, leaf_parents);
    collect_leaf_parents(x.right, leaf_parents);
  }
}

function black_height(x: Node): number {
  let height = 0;

  while (x.p !== NIL) {
    if (!x.red) {
      height += 1;
    }
    x = x.p;
  }

  return height;
}
