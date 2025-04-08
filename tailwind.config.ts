import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

// 我們不再需要定義 ExtendedConfig，因為會使用 satisfies 運算符

const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [
        'text-heading',
        'bg-primary',
        'text-primary',
        'bg-secondary',
        'text-secondary',
        'font-roboto',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#dcb14a',
                secondary: '#000000',
                heading: '#111111',
            },
            backgroundImage: {
                'offer-colection': "url('/images/offer-colection/countdown.jpg')",
                megamenu: "url('/images/megamenu/bg-menu.jpg')",
            },
            fontFamily: {
                roboto: ['var(--font-roboto)', 'sans-serif'],
                prata: ['Prata', 'serif'],
                haviland: ['Mr De Haviland', 'cursive'],
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(70px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
            },
            screens: {
                '2xl': '1400px',
                'max-lg': { max: '1199px' },
                'max-md': { max: '991px' },
                'max-lm': { max: '767px' },
                'max-sm': { max: '575px' },
                'max-xs': { max: '479px' },
                'fixed-xs': { max: '479px' },
                'fixed-sm': { min: '480px', max: '575px' },
                'fixed-lm': { min: '576px', max: '767px' },
                'fixed-md': { min: '768px', max: '991px' },
                'fixed-lg': { min: '992px', max: '1199px' },
            },
            container: {
                center: true,
                padding: '15px',
            },
        },
    },
    plugins: [
        plugin(({ addUtilities }) => {
            // 強制新增自訂顏色的工具類
            const customColors = {
                '.text-primary': { color: '#dcb14a' },
                '.text-secondary': { color: '#000000' },
                '.text-heading': { color: '#111111' },
                '.bg-primary': { backgroundColor: '#dcb14a' },
                '.bg-secondary': { backgroundColor: '#000000' },
                '.bg-heading': { backgroundColor: '#111111' },
            };

            addUtilities(customColors);
        })
    ],
} satisfies Config;

export default config;