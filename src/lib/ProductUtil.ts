import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { MarkdownItem } from '../types';

export function getItemsFiles(type: string): string[] {
    const itemsDirectory = path.join(process.cwd(), 'src/data', type);
    return fs.readdirSync(itemsDirectory);
}

export function getItemData(itemIdentifier: string, type: string): MarkdownItem {
    const itemsDirectory = path.join(`${process.cwd()}/src/data/${type}`);
    const itemSlug = itemIdentifier.replace(/\.md$/, '');
    const filePath = path.join(itemsDirectory, `${itemSlug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const itemData: MarkdownItem = {
        slug: itemSlug,
        ...data,
        content,
    };

    return itemData;
}

export function getAllItems(type: string): MarkdownItem[] {
    const itemFiles = getItemsFiles(type);

    const allItems = itemFiles.map((itemFile) => getItemData(itemFile, type));

    const sortedItems = allItems.sort((itemA, itemB) =>
        (itemA.date as string) > (itemB.date as string) ? -1 : 1
    );

    return sortedItems;
}

export function getFeaturedItems(items: MarkdownItem[]): MarkdownItem[] {
    return items.filter((item) => item.isFeatured);
}
