import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {ItemData} from "@/lib/ItemDataTypes";



export function getItemsFiles(type: string): string[] {
    const itemsDirectory = path.join(process.cwd(), 'src/data', type);
    return fs.readdirSync(itemsDirectory);
}

export function getItemData(itemIdentifier: string, type: string): ItemData {
    const itemsDirectory = path.join(`${process.cwd()}/src/data/${type}`);
    const itemSlug = itemIdentifier.replace(/\.md$/, ''); // removes the file extension
    const filePath = path.join(itemsDirectory, `${itemSlug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const itemData: ItemData = {
        slug: itemSlug,
        ...data,
        content,
    };

    return itemData;
}

export function getAllItems(type: string): ItemData[] {
    const itemFiles = getItemsFiles(type);

    const allItems = itemFiles.map((itemFile) => getItemData(itemFile, type));

    const sortedItems = allItems.sort((itemA, itemB) => {
        // Handle cases where date might be undefined
        const dateA = itemA.date || '0000-00-00';
        const dateB = itemB.date || '0000-00-00';
        return dateA > dateB ? -1 : 1;
    });

    return sortedItems;
}

export function getFeaturedItems(items: ItemData[]): ItemData[] {
    return items.filter((item) => item.isFeatured);
}