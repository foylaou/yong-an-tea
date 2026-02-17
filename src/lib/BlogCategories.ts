import { getAllItems } from './ItemsUtil';
import { flatDeep } from '../utils/flatDeep';

export const getBlogCategories = (): string[] => {
    const blogs = getAllItems('blogs');

    const categories = flatDeep<string>(blogs.map((blog) => blog.category as string[]));

    return [...new Set(categories)];
};
