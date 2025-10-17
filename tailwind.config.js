import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Segoe UI', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    50: '#e6f7f7',
                    100: '#b3e6e6',
                    200: '#80d4d4',
                    300: '#4dc2c2',
                    400: '#1ab0b0',
                    500: '#0d7377',
                    600: '#0a5d61',
                    700: '#08474a',
                    800: '#053133',
                    900: '#021b1c',
                },
                secondary: {
                    50: '#e3f2fd',
                    100: '#bbdefb',
                    200: '#90caf9',
                    300: '#64b5f6',
                    400: '#42a5f5',
                    500: '#2196f3',
                    600: '#1e88e5',
                    700: '#1976d2',
                    800: '#1565c0',
                    900: '#0d47a1',
                },
            },
        },
    },

    plugins: [forms],
};
