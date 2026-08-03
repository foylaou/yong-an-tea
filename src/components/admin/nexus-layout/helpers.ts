import { ISidebarMenuItem } from './SidebarMenuItem';

function findItem(menuItems: ISidebarMenuItem[], url: string): ISidebarMenuItem | null {
  for (const item of menuItems) {
    if (item.url === url) {
      return item;
    }
    if (item.children) {
      const found = findItem(item.children, url);
      if (found) return found;
    }
  }
  return null;
}

export function getActivatedItemParentKeys(menuItems: ISidebarMenuItem[], url: string): Set<string> {
  const menuItem = findItem(menuItems, url);
  if (!menuItem) return new Set();

  const list: string[] = [];

  for (const item of menuItems) {
    if (item.id === menuItem.id) {
      list.push(item.id);
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.id === menuItem.id) {
          list.push(item.id, child.id);
        }
        if (child.children) {
          for (const grandchild of child.children) {
            if (grandchild.id === menuItem.id) {
              list.push(item.id, child.id, grandchild.id);
            }
          }
        }
      }
    }
  }
  return new Set(list);
}
