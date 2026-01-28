import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                surface: "#1c1c1e", // Apple dark mode grouped background
                "surface-highlight": "#2c2c2e",
                primary: "#0a84ff", // Apple System Blue Dark Mode
                secondary: "#5e5ce6", // Apple System Indigo Dark Mode
                success: "#30d158", // Apple System Green Dark Mode
                danger: "#ff453a", // Apple System Red Dark Mode
                text: "#f5f5f7",
                "text-muted": "#86868b",
                divider: "#38383a",
            },
            backdropBlur: {
                xs: '2px',
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'scale-in': 'scaleIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'expand': 'expand 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                expand: {
                    '0%': { opacity: '0', maxHeight: '0' },
                    '100%': { opacity: '1', maxHeight: '200px' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
