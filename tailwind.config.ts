import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                surface: "#1c1c1e",
                "surface-highlight": "#2c2c2e",
                primary: "#0a84ff",
                secondary: "#5e5ce6",
                success: "#30d158",
                danger: "#ff453a",
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
                'ring-pulse': 'ringPulse 0.6s ease-out',
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
                },
                ringPulse: {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.08)', opacity: '0.8' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
};
export default config;
