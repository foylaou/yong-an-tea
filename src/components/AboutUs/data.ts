// ✅ 範例資料
import {AboutUsProps} from "@/components/AboutUs/AboutUs";

export const data: AboutUsProps = {
    aboutItems: [
        {
            videoBanner: '/videos/banner.mp4',
            videoBannerAlt: '公司介紹影片',
            singleSupportInfo: [
                {
                    id: 1,
                    infoIcon: '/icons/mission.svg',
                    title: '我們的使命',
                    desc: '致力於提供最優質的產品與服務。',
                },
                {
                    id: 2,
                    infoIcon: '/icons/vision.svg',
                    title: '我們的願景',
                    desc: '成為業界領導品牌，創造永續價值。',
                },
            ],
            perfectionTitle: '追求卓越',
            perfectionDesc: '我們不斷精進，只為帶給您最好的體驗。',
            aboutBannerOne: '/images/about1.jpg',
            aboutBannerTwo: '/images/about2.jpg',
            aboutBannerThree: '/images/about3.jpg',
            aboutBannerFour: '/images/about4.jpg',
            aboutBannerFive: '/images/about5.jpg',
            aboutBannerAlt: '關於我們橫幅圖片',
            addressTitleOne: '台北總部',
            addressDescOne: '台北市信義區信義路 100 號 10 樓',
            addressTitleTwo: '高雄分部',
            addressDescTwo: '高雄市前鎮區成功一路 88 號 5 樓',
        },
    ],
};
