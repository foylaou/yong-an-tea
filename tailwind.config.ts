/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#dcb14a',
                secondary: '#000000',
                heading: '#111111',
                test: '#ff0000',
            },
            backgroundImage: {
                'offer-colection': "url('/images/offer-colection/countdown.jpg')",
                megamenu: "url('/images/megamenu/bg-menu.jpg')",
            },
            fontFamily: {
                sans: ['var(--font-sans)'],
                roboto: ['var(--font-roboto)', 'Roboto', 'sans-serif'],
                prata: ['Prata', 'serif'],
                haviland: ['Mr De Haviland', 'cursive'],
            },
        },
        screens: {
            xs: '480px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1400px',
            // 自定義斷點
            lm: '576px',
            xxl: '1400px',
        },
    },
    plugins: [],
}