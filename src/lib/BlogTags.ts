import { getAllItems } from './ItemsUtil';
import { flatDeep } from '@/utils/flatDeep';
import {ItemData} from "@/lib/ItemDataTypes";


export const getBlogTags = (): string[] => {
    const blogs: ItemData[] = getAllItems('blogs');

    const rawTags = flatDeep(
        blogs.map((blog) => blog.tag || [])
    );

    const tags = rawTags.filter((tag): tag is string => typeof tag === 'string');

    return [...new Set(tags)];
};
