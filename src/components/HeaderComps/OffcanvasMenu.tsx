import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { IoCaretDownOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { createClient } from '../../lib/supabase/client';

interface OffcanvasMenuProps {
    onNavigate?: () => void;
}

function OffcanvasMenu({ onNavigate }: OffcanvasMenuProps) {
    const blogEnabled = useSettingsStore((s) => s.blog_enabled);
    const menuJson = useSettingsStore((s) => s.header_menu_json);
    const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

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

    // Inject categories into the product submenu
    const enrichedMenuItems = useMemo(() => {
        if (categories.length === 0) return menuItems;
        return menuItems.map((item: any) => {
            if (item.path?.startsWith('/products') && item.headerSubmenu) {
                const categorySubmenu = categories.map((cat) => ({
                    id: `cat-${cat.slug}`,
                    submenuTitle: cat.name,
                    submenuPath: `/products?category=${cat.slug}`,
                }));
                return {
                    ...item,
                    headerSubmenu: [
                        ...categorySubmenu,
                        ...(item.headerSubmenu || []).filter(
                            (sub: any) => !sub.id?.startsWith('cat-') && sub.id !== 'product-categories'
                        ),
                    ],
                };
            }
            return item;
        });
    }, [menuItems, categories]);

    const [submenuOpenId, setSubmenuOpenId] = useState<Record<string, boolean>>({});

    const showSubmenuClickHandler = (id: number) =>
        setSubmenuOpenId((prevData) => ({
            [id.toString()]: !prevData[id.toString()],
        }));

    return (
        <ul className="offcanvas-menu-items pt-[75px]">
            {enrichedMenuItems.map((item: any) => {
                const isProductMenu = item.path?.startsWith('/products');
                const hasSubmenu = item.headerSubmenu && item.headerSubmenu.length > 0;

                return (
                    <li
                        key={item.id}
                        className={`${hasSubmenu && !isProductMenu ? 'has-children' : ''}${
                            submenuOpenId[item.id.toString()] ? ' active' : ''
                        } mb-[15px] last:mb-0`}
                    >
                        {hasSubmenu && isProductMenu ? (
                            <>
                                <Link
                                    href={item.path}
                                    onClick={onNavigate}
                                    className="font-medium flex justify-between items-center transition-all hover:text-[#666666]"
                                >
                                    {item.title}
                                </Link>
                                <ul className="submenu pl-[10px] mt-[15px]">
                                    {item.headerSubmenu.map((sub: any) => (
                                        <li key={sub.id} className="mb-[15px] last:mb-0">
                                            <Link
                                                href={sub.submenuPath}
                                                onClick={onNavigate}
                                                className="flex justify-between items-center transition-all hover:text-[#666666]"
                                            >
                                                {sub.submenuTitle}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : hasSubmenu ? (
                            <>
                                <span
                                    onClick={() => showSubmenuClickHandler(item.id)}
                                    className="menu-expand font-medium cursor-pointer flex justify-between items-center transition-all hover:text-[#666666]"
                                >
                                    {item.title}
                                    <IoCaretDownOutline className="menu-icon" />
                                </span>
                                <ul className="submenu pl-[10px] mt-[15px]">
                                    {item.headerSubmenu.map((sub: any) => (
                                        <li key={sub.id} className="mb-[15px] last:mb-0">
                                            <Link
                                                href={sub.submenuPath}
                                                onClick={onNavigate}
                                                className="flex justify-between items-center transition-all hover:text-[#666666]"
                                            >
                                                {sub.submenuTitle}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <Link
                                href={item.path}
                                onClick={onNavigate}
                                className="font-medium flex justify-between items-center transition-all hover:text-[#666666]"
                            >
                                {item.title}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export default OffcanvasMenu;
