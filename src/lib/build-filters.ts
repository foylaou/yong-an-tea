import type { MarkdownItem } from '../types';

// ---------------------------------------------------------------------------
// Translation maps (hardcoded)
// ---------------------------------------------------------------------------
const tagLabel: Record<string, string> = {
    accessories: '配件',
    chair: '椅子',
    glass: '玻璃',
    deco: '裝飾',
    table: '桌子',
};

export const availabilityLabel: Record<string, string> = {
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
