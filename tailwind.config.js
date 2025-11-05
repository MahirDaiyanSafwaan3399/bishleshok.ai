/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to scan all your React components
    ],
    theme: {
        extend: {
            fontFamily: {
                // Add your custom font from the original file
                sans: ['"Space Grotesk"', "sans-serif"],
            },
        },
    },
    plugins: [],
};
