import type { Buffer } from "./buffer.ts";
import type { Node } from "./node.ts";

export interface Tree {
  root: Node;
  bufs: Buffer[];
}
