import { getAllItems } from './ItemsUtil';
import { flatDeep } from '../utils/flatDeep';

export const getBlogTags = (): string[] => {
    const blogs = getAllItems('blogs');

    const tags = flatDeep<string>(blogs.map((blog) => blog.tag as string[]));

    return [...new Set(tags)];
};
