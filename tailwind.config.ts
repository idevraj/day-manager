import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        heat: {
          0: "hsl(var(--heat-0))",
          1: "hsl(var(--heat-1))",
          2: "hsl(var(--heat-2))",
          3: "hsl(var(--heat-3))",
          4: "hsl(var(--heat-4))",
        },
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          pink: "hsl(var(--neon-pink))",
          purple: "hsl(var(--neon-purple))",
          green: "hsl(var(--neon-green))",
          orange: "hsl(var(--neon-orange))",
          yellow: "hsl(var(--neon-yellow))",
          blue: "hsl(var(--neon-blue))",
          red: "hsl(var(--neon-red))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          from: { height: "0", opacity: "0", transform: "translateY(-8px)" },
          to: { height: "var(--radix-collapsible-content-height)", opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { height: "var(--radix-collapsible-content-height)", opacity: "1", transform: "translateY(0)" },
          to: { height: "0", opacity: "0", transform: "translateY(-8px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-in-bounce": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "60%": { transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(270 100% 65% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(270 100% 65% / 0.5)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "70%": { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.35s cubic-bezier(0.33, 1, 0.68, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
        "fade-in": "fade-in 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
        "fade-out": "fade-out 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-down": "fade-in-down 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
        "fade-in-left": "fade-in-left 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
        "fade-in-right": "fade-in-right 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
        "slide-down": "slide-down 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
        "slide-up": "slide-up 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
        "scale-in-bounce": "scale-in-bounce 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "pop-in": "pop-in 0.35s cubic-bezier(0.33, 1, 0.68, 1)",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
