import { useState, useMemo } from 'react';
import Link from 'next/link';
import { IoCaretDownOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

function OffcanvasMenu() {
    const blogEnabled = useSettingsStore((s) => s.blog_enabled);
    const menuJson = useSettingsStore((s) => s.header_menu_json);
    const menuItems = useMemo(() => {
        let items: any[] = [];
        try { items = JSON.parse(menuJson); } catch { items = []; }
        if (blogEnabled === 'false') {
            return items.filter((item: any) => !item.path?.includes('/blogs'));
        }
        return items;
    }, [menuJson, blogEnabled]);

    const [submenuOpenId, setSubmenuOpenId] = useState<Record<string, boolean>>({});

    const showSubmenuClickHandler = (id: number) =>
        setSubmenuOpenId((prevData) => ({
            [id.toString()]: !prevData[id.toString()],
        }));

    return (
        <ul className="offcanvas-menu-items pt-[75px]">
            {menuItems.map((item: any) => {
                const hasSubmenu = item.headerSubmenu && item.headerSubmenu.length > 0;

                return (
                    <li
                        key={item.id}
                        className={`${hasSubmenu ? 'has-children' : ''}${
                            submenuOpenId[item.id.toString()] ? ' active' : ''
                        } mb-[15px] last:mb-0`}
                    >
                        {hasSubmenu ? (
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
