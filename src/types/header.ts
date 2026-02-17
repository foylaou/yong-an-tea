export interface HeaderLogo {
    id: string;
    darkLogo: string;
    darkLogoAlt: string;
}

export interface LanguageItem {
    id: string;
    text: string;
    path: string;
}

export interface CurrencyItem {
    id: string;
    text: string;
    path: string;
}

export interface SocialItem {
    id: number;
    socialIcon: string;
    path: string;
}

export interface SubmenuItem {
    id: string;
    submenuTitle: string;
    submenuPath: string;
}

export interface MegamenuGroupItem {
    id: string;
    megamenuTitle: string;
    megamenuPath: string;
}

export interface MegamenuGroup {
    id: string;
    groupName: string;
    groupItems: MegamenuGroupItem[];
}

export interface HeaderMenuItem {
    id: number;
    title: string;
    path: string;
    holderCName: string;
    submenuCName?: string;
    megamenuCName?: string;
    headerSubmenu?: SubmenuItem[];
    headerMegamenu?: MegamenuGroup[];
}

export interface CategoryItem {
    id: number;
    title: string;
}

export interface HeaderNumberInfo {
    id: number;
    numberUrl: string;
    numberInText: string;
}

export interface HeaderData {
    headerLogo: HeaderLogo[];
    languageTitle: string;
    languageList: LanguageItem[];
    currencyTitle: string;
    currencyList: CurrencyItem[];
    contactInfoTitle: string;
    contactInfo: string;
    socialTitle: string;
    socialList: SocialItem[];
    homeBoxedMenu: HeaderMenuItem[];
    categoryList: CategoryItem[];
    headerNumberInfo: HeaderNumberInfo[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
