import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { createClient } from '../../lib/supabase/client';

interface HeaderMenuProps {
    differentPositionCName: string;
}

function HeaderMenu({ differentPositionCName }: HeaderMenuProps) {
    const blogEnabled = useSettingsStore((s) => s.blog_enabled);
    const menuJson = useSettingsStore((s) => s.header_menu_json);
    const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

    // Fetch categories from DB on mount
    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('categories')
            .select('slug, name')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                if (data) setCategories(data);
            });
    }, []);

    const menuItems = useMemo(() => {
        let items: any[] = [];
        try { items = JSON.parse(menuJson); } catch { items = []; }
        if (blogEnabled === 'false') {
            return items.filter((item: any) => !item.path?.includes('/blogs'));
        }
        return items;
    }, [menuJson, blogEnabled]);

    // Inject categories into the "商品" submenu
    const enrichedMenuItems = useMemo(() => {
        if (categories.length === 0) return menuItems;
        return menuItems.map((item: any) => {
            // Find the product menu item (path = /products)
            if (item.path?.startsWith('/products') && item.submenuCName) {
                const categorySubmenu = categories.map((cat) => ({
                    id: `cat-${cat.slug}`,
                    submenuTitle: cat.name,
                    submenuPath: `/products?category=${cat.slug}`,
                }));
                return {
                    ...item,
                    headerSubmenu: [
                        ...categorySubmenu,
                        // Keep original items (cart, wishlist, etc.) as divider
                        ...(item.headerSubmenu || []).filter(
                            (sub: any) => !sub.id?.startsWith('cat-') && sub.id !== 'product-categories'
                        ),
                    ],
                };
            }
            return item;
        });
    }, [menuItems, categories]);

    return (
        <div className={`${differentPositionCName} header-menu`}>
            <nav>
                <ul className="flex justify-center">
                    {enrichedMenuItems.map((menuOne: any) => (
                        <li
                            className={`${menuOne.holderCName} py-[50px] mr-[55px] last:mr-0`}
                            key={menuOne.id}
                        >
                            <Link href={menuOne.path}>{menuOne.title}</Link>
                            {menuOne.submenuCName && !menuOne.megamenuCName && (
                                <ul className={`${menuOne.submenuCName}`}>
                                    {menuOne?.headerSubmenu?.map(
                                        (submenuOne: any) => (
                                            <li key={submenuOne.id}>
                                                <Link
                                                    href={`${submenuOne.submenuPath}`}
                                                >
                                                    {submenuOne.submenuTitle}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                            {menuOne.megamenuCName && !menuOne.submenuCName && (
                                <ul className={`${menuOne.megamenuCName} flex`}>
                                    {menuOne?.headerMegamenu?.map(
                                        (megamenuOne: any) => (
                                            <li
                                                className="basis-[22%] px-[15px]"
                                                key={megamenuOne.id}
                                            >
                                                <span className="font-medium block mb-[20px]">
                                                    {megamenuOne.groupName}
                                                </span>
                                                <ul>
                                                    {megamenuOne?.groupItems?.map(
                                                        (groupItem: any) => (
                                                            <li
                                                                className="mb-[10px] last:mb-0"
                                                                key={
                                                                    groupItem.id
                                                                }
                                                            >
                                                                <Link
                                                                    href={`${groupItem.megamenuPath}`}
                                                                    className="font-normal transition-all hover:text-primary"
                                                                >
                                                                    {
                                                                        groupItem.megamenuTitle
                                                                    }
                                                                </Link>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default HeaderMenu;
