/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/styles/**/*.css',
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
                sans: ['var(--font-noto-sans-tc)'],
                roboto: ['var(--font-roboto)', 'Roboto', 'sans-serif'],
                prata: ['Prata', 'serif'],
                haviland: ['Mr De Haviland', 'cursive'],
            },
            animation: {
                slideUp: {
                    '0%': { transform: 'translateY(70px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
            },
        },
        container: {
            center: true,
            padding: '15px',
            screens: {
                sm: '480px',
                lm: '575px',
                md: '768px',
                lg: '992px',
                xl: '1200px',
            },
        },
        screens: {
            // Maximum Medium Query
            'max-lg': { max: '1199px' },
            'max-md': { max: '991px' },
            'max-lm': { max: '767px' },
            'max-sm': { max: '575px' },
            'max-xs': { max: '479px' },

            // Fixed Medium Query
            'fixed-xs': { max: '479px' },
            'fixed-sm': { min: '480px', max: '575px' },
            'fixed-lm': { min: '576px', max: '767px' },
            'fixed-md': { min: '768px', max: '991px' },
            'fixed-lg': { min: '992px', max: '1199px' },

            // Minimum Medium Query
            sm: '480px',
            lm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            xxl: '1400px',
        },
    },
    safelist: [
        // 基本文字樣式
        'text-base',
        'text-lg',
        'text-xl',
        'text-2xl',
        'text-3xl',
        'font-normal',
        'font-medium',
        'font-bold',
        'font-roboto',
        'leading-4',
        'leading-5',
        'leading-6',
        'leading-7',
        'leading-8',
        'leading-9',
        'leading-10',

        // 排版和顯示
        'block',
        'hidden',
        'flex',
        'flex-col',
        'flex-col-reverse',
        'items-center',
        'justify-between',
        'static',
        'fixed',
        'relative',
        'absolute',
        'invisible',
        'visible',
        'opacity-0',
        'opacity-30',
        'opacity-70',
        'opacity-100',

        // 邊距和填充
        'mx-auto',
        'w-full',
        'min-w-[70px]',
        'min-w-[130px]',
        'min-w-[370px]',

        // 變形和動畫
        'transform',
        'rotate-180',
        'translate-y-1/2',
        '-translate-x-1/2',
        'transition-all',
        'duration-[500ms]',

        // 背景和邊框
        'bg-white',
        'bg-primary',
        'bg-green-500',
        'bg-red-700',
        'bg-black',
        'bg-gray-500',
        'bg-yellow-500',
        'bg-[#1a8ed1]',
        'border',
        'border-r',
        'border-r-black',
        'border-[#dddddd]',
        'shadow-[0_1px_1px_0_#f0f0f0]',

        // 特殊類
        'cursor-pointer',
        'z-10',
        'z-30',
        'z-50',
        'before:content-none',
        'last:border-r-0',
        'last:mr-0',
        'last:pr-0',
        'last:mb-0',
        'group-hover:top-[calc(100%-20px)]',
        'group-hover:opacity-100',
        'group-hover:visible',
        'hover:text-black',
        'hover:text-primary',
    ],
    plugins: [],
}