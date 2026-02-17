export interface FooterListItem {
    id: number;
    title: string;
    path: string;
}

export interface FooterSocialItem {
    id: number;
    socialIcon: string;
    path: string;
}

export interface FooterData {
    addressTitle: string;
    address: string;
    contactNumber: string;
    contactNumberText: string;
    socialTitle: string;
    socialList: FooterSocialItem[];
    infoTitle: string;
    infoList: FooterListItem[];
    aboutTitle: string;
    aboutList: FooterListItem[];
    socialMediaTitle: string;
    socialMediaList: FooterListItem[];
    newsletterTitle: string;
    menuList: FooterListItem[];
    footerLogo: string;
    footerLogoAlt: string;
    footerLogoPath: string;
    copyrightLink: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
