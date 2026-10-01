import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        sans: ["var(--font-josefin)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-josefin)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        primaryColor: {
          DEFAULT: "#fcd34d",
        },
        secondaryColor: {
          DEFAULT: "#252A34",
        },
        neutralColor: {
          DEFAULT: "#F0F5F9",
        },
        FourthColor: {
          DEFAULT: "#BBE1FA",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        /* Deep ink surface ramp for the premium redesign. */
        ink: {
          950: "#07070a",
          900: "#0b0a0f",
          800: "#121018",
          700: "#17141a",
          600: "#1d1922",
          500: "#26222e",
        },
        gold: {
          DEFAULT: "#fcd34d",
          soft: "#f5c451",
          deep: "#e0a92a",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px -28px rgba(0,0,0,0.85)",
        lift: "0 34px 70px -34px rgba(0,0,0,0.95)",
        gold: "0 18px 50px -18px rgba(252,211,77,0.4)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        aurora: {
          "0%, 100%": {
            transform: "translate3d(-4%, -2%, 0) scale(1.05)",
            opacity: "0.55",
          },
          "50%": {
            transform: "translate3d(4%, 3%, 0) scale(1.18)",
            opacity: "0.85",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.6" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% center" },
          to: { backgroundPosition: "0% center" },
        },
        "page-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        aurora: "aurora 18s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 3.2s ease-out infinite",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 6s linear infinite",
        "page-in": "page-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
