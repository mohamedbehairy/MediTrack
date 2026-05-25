/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6600",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#194E5B",
          foreground: "#ffffff",
        },
        background: {
          DEFAULT: "#F8FAFC",
          dark: "#090D14",
        },
        foreground: {
          DEFAULT: "#0F172A",
          dark: "#F1F5F9",
        },
        accent: {
          blue: "#0EA5E9",
          rose: "#F43F5E",
          emerald: "#10B981",
        },
      },
      backgroundImage: {
        "gradient-secondary": "linear-gradient(135deg, #194E5B 0%, #090D14 100%)",
        "gradient-primary": "linear-gradient(135deg, #FF6600 0%, #F97316 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
