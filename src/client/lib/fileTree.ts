import { ItemViewModel } from "../../lib/view-models/items";
import type { TreeNode } from "../components/SidebarArticles";

export type FileTreeNodeMap = { [name: string]: TreeNode };
export type FileTreeNode = {
  name: string;
  items: ItemViewModel[];
  children: FileTreeNodeMap;
};

export const fileTreeFromItemViewModels = (
  items: ItemViewModel[],
): FileTreeNode => {
  const topLevelItems: ItemViewModel[] = [];
  const roots: FileTreeNodeMap = {};

  const addToTree = (segments: string[], item: ItemViewModel) => {
    const rootName = segments[0];
    if (!roots[rootName])
      roots[rootName] = { name: rootName, items: [], children: {} };
    let node = roots[rootName];
    const rest = segments.slice(1);
    if (rest.length === 0) {
      node.items.push(item);
      return;
    }
    for (const seg of rest) {
      if (!node.children[seg])
        node.children[seg] = { name: seg, items: [], children: {} };
      node = node.children[seg];
    }
    node.items.push(item);
  };

  items.forEach((item) => {
    if (!item.parent || item.parent.length === 0) {
      topLevelItems.push(item);
    } else {
      addToTree(item.parent, item);
    }
  });

  return {
    name: "root",
    items: topLevelItems,
    children: roots,
  };
};
