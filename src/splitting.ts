import { insert_after } from "./insertion.ts";
import { bubble, type Node } from "./node.ts";
import type { Tree } from "./tree.ts";

export function split(tree: Tree, x: Node, index: number, gap: number): Node {
  const node = tree.split_node(x, index, gap);

  bubble(x);

  insert_after(tree, x, node);

  return node;
}
