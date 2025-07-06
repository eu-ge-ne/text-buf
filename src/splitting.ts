import { insert_after } from "./insertion.ts";
import { bubble, type Node, split_node } from "./node.ts";
import type { Tree } from "./tree.ts";

export function split(tree: Tree, x: Node, index: number, gap: number): Node {
  const node = split_node(tree, x, index, gap);

  bubble(x);

  insert_after(tree, x, node);

  return node;
}
