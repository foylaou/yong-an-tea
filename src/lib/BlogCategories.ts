import { getAllItems } from './ItemsUtil';
import { flatDeep } from '@/utils/flatDeep';
import {ItemData} from "@/lib/ItemDataTypes";


export const getBlogCategories = (): string[] => {
    const blogs: ItemData[] = getAllItems('blogs');

    const rawCategories = flatDeep(
        blogs.map((blog) => blog.category || [])
    );

    const categories = rawCategories.filter(
        (cat): cat is string => typeof cat === 'string'
    );

    return [...new Set(categories)];
};