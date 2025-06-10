import { insert_after } from "./insertion.ts";
import { bubble_update, new_node, type Node, type Tree } from "./node.ts";
import { split_slice } from "./slice.ts";

export function split(tree: Tree, x: Node, index: number, gap: number): Node {
  const slice = split_slice(x.slice, index, gap);

  bubble_update(x);

  const node = new_node(slice);

  insert_after(tree, x, node);

  return node;
}
