/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
				// TfL Corporate Colors with their official values
				tfl: {
					blue: {
						DEFAULT: "#0019A8", // PMS 072
						rgb: "rgb(0, 25, 168)",
						cmyk: "cmyk(100, 97, 3, 3)",
					},
					red: {
						DEFAULT: "#E1251B", // PMS 485
						rgb: "rgb(225, 37, 27)",
						cmyk: "cmyk(6, 98, 100, 1)",
					},
					yellow: {
						DEFAULT: "#FFCD00", // PMS 116
						rgb: "rgb(255, 205, 0)",
						cmyk: "cmyk(0, 18, 100, 0)",
					},
					green: {
						DEFAULT: "#007934", // PMS 356
						rgb: "rgb(0, 121, 52)",
						cmyk: "cmyk(96, 27, 100, 15)",
					},
					black: {
						DEFAULT: "#000000", // PMS Black
						rgb: "rgb(0, 0, 0)",
						cmyk: "cmyk(0, 0, 0, 100)",
					},
					white: {
						DEFAULT: "#FFFFFF", // Corporate White
						rgb: "rgb(255, 255, 255)",
					},
					grey: {
						DEFAULT: "#838D93", // PMS 430
						rgb: "rgb(131, 141, 147)",
						cmyk: "cmyk(55, 41, 38, 5)",
					},
					"dark-grey": {
						DEFAULT: "#323E48", // PMS 432
						rgb: "rgb(50, 62, 72)",
						cmyk: "cmyk(79, 64, 52, 44)",
					},
				},
				// Semantic mappings using TfL colors
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
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
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
	plugins: [require("@tailwindcss/forms")],
};
