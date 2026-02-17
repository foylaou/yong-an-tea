import type { MarkdownItem } from '../types';

// ---------------------------------------------------------------------------
// Translation maps (hardcoded)
// ---------------------------------------------------------------------------
const colorLabel: Record<string, string> = {
    black: '黑色',
    green: '綠色',
    gray: '灰色',
    red: '紅色',
    yellow: '黃色',
};

const tagLabel: Record<string, string> = {
    accessories: '配件',
    chair: '椅子',
    glass: '玻璃',
    deco: '裝飾',
    table: '桌子',
};

const sizeLabel: Record<string, string> = {
    large: '大',
    medium: '中',
    small: '小',
};

const availabilityLabel: Record<string, string> = {
    'in-stock': '有庫存',
    'out-of-stock': '缺貨',
};

// ---------------------------------------------------------------------------
// buildProductFilters
// ---------------------------------------------------------------------------
type Category = { slug: string; name: string };

export function buildProductFilters(
    products: MarkdownItem[],
    categories: Category[],
): MarkdownItem[] {
    // --- categoryList ---
    const categoryList = categories.map((cat, i) => ({
        id: `categoryList-${String(i + 1).padStart(2, '0')}`,
        categoryListTitle: cat.name,
        categorySlug: cat.slug,
    }));

    // --- availabilityList ---
    const availabilityCounts: Record<string, number> = {};
    for (const p of products) {
        const val = (p.availability as string) || 'in-stock';
        availabilityCounts[val] = (availabilityCounts[val] || 0) + 1;
    }
    const availabilityList = Object.entries(availabilityCounts).map(
        ([key, count], i) => {
            const label = availabilityLabel[key] || key;
            return {
                id: `availabilityList-${String(i + 1).padStart(2, '0')}`,
                filterLabel: `filter-availability-${i + 1}`,
                title: `${label} (${count})`,
                name: label,
                checked: key,
                key,
                group: 'availability',
            };
        },
    );

    // --- productSizeList ---
    const sizeCounts: Record<string, number> = {};
    for (const p of products) {
        const val = (p.size as string) || '';
        if (val) sizeCounts[val] = (sizeCounts[val] || 0) + 1;
    }
    // Sort by defined order
    const sizeOrder = ['large', 'medium', 'small'];
    const sortedSizes = Object.keys(sizeCounts).sort(
        (a, b) => (sizeOrder.indexOf(a) === -1 ? 99 : sizeOrder.indexOf(a))
              - (sizeOrder.indexOf(b) === -1 ? 99 : sizeOrder.indexOf(b)),
    );
    const productSizeList = sortedSizes.map((key, i) => {
        const label = sizeLabel[key] || key;
        return {
            id: `size-${String(i + 1).padStart(2, '0')}`,
            filterLabel: `${key}-size`,
            title: `${label} (${sizeCounts[key]})`,
            name: label,
            checked: key,
            key,
            group: 'size',
        };
    });

    // --- colorList ---
    const colorSet = new Set<string>();
    for (const p of products) {
        const val = (p.color as string) || '';
        if (val) colorSet.add(val);
    }
    const colorOrder = ['black', 'green', 'gray', 'red', 'yellow'];
    const sortedColors = [...colorSet].sort(
        (a, b) => (colorOrder.indexOf(a) === -1 ? 99 : colorOrder.indexOf(a))
              - (colorOrder.indexOf(b) === -1 ? 99 : colorOrder.indexOf(b)),
    );
    const colorListResult = sortedColors.map((key, i) => ({
        id: `color-${String(i + 1).padStart(2, '0')}`,
        colorOption: key,
        colorLabel: colorLabel[key] || key,
    }));

    // --- tagList ---
    const tagSet = new Set<string>();
    for (const p of products) {
        const val = (p.tag as string) || '';
        if (val) tagSet.add(val);
    }
    const tagOrder = ['accessories', 'chair', 'glass', 'deco', 'table'];
    const sortedTags = [...tagSet].sort(
        (a, b) => (tagOrder.indexOf(a) === -1 ? 99 : tagOrder.indexOf(a))
              - (tagOrder.indexOf(b) === -1 ? 99 : tagOrder.indexOf(b)),
    );
    const tagListResult = sortedTags.map((key, i) => ({
        id: `tag-${String(i + 1).padStart(2, '0')}`,
        tagTitle: tagLabel[key] || key,
        tagSlug: key,
        marginRight: i < sortedTags.length - 1 ? 'mr-[10px]' : '',
    }));

    // Return as MarkdownItem[] (single-element array matching existing shape)
    return [
        {
            categoryList,
            availabilityList,
            productSizeList,
            colorList: colorListResult,
            tagList: tagListResult,
        } as MarkdownItem,
    ];
}

// ---------------------------------------------------------------------------
// buildProductTabs
// ---------------------------------------------------------------------------
export function buildProductTabs(categories: Category[]): MarkdownItem[] {
    const tabList = [
        { id: 'product-tab-01', title: '所有商品', filterValue: 'all-products' },
        ...categories.map((cat, i) => ({
            id: `product-tab-${String(i + 2).padStart(2, '0')}`,
            title: cat.name,
            filterValue: cat.slug,
        })),
    ];

    return [{ tabList } as MarkdownItem];
}
