import { useMemo } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface HeaderMenuProps {
    differentPositionCName: string;
}

function HeaderMenu({ differentPositionCName }: HeaderMenuProps) {
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

    return (
        <div className={`${differentPositionCName} header-menu`}>
            <nav>
                <ul className="flex justify-center">
                    {menuItems.map((menuOne: any) => (
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
