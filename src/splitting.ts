import { insert_after } from "./insertion.ts";
import { new_node, type Node } from "./node.ts";
import { split_slice } from "./slice.ts";
import { bubble, type Tree } from "./tree.ts";

export function split(tree: Tree, x: Node, index: number, gap: number): Node {
  const slice = split_slice(x.slice, index, gap);

  bubble(x);

  const node = new_node(slice);

  insert_after(tree, x, node);

  return node;
}
