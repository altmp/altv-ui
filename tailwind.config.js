import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";
import {
	scopedPreflightStyles,
	isolateInsideOfContainer,
} from "tailwindcss-scoped-preflight";

/**
 * @param {number} px
 * @returns {string}
 */
const pixelToRem = (px) => `${(px / 16).toFixed(5)}rem`;

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{ts,vue}"],
	plugins: [
		animate,
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer(".tw"),
		}),
		plugin(({ addComponents }) => {
			addComponents({
				".scrollbar-vertical::-webkit-scrollbar": {
					width: "10px",
				},
				".scrollbar-vertical::-webkit-scrollbar-thumb": {
					border: "3px solid rgba(0, 0, 0, 0)",
					backgroundClip: "padding-box",
					borderRadius: "9999px",
					backgroundColor: "rgba(255, 255, 255, 0.25)",
				},
				".scrollbar-vertical::-webkit-scrollbar-thumb:hover": {
					backgroundColor: "rgba(255, 255, 255, 0.4)",
				},
			});
		}),
	],
	theme: {
		extend: {
			strokeWidth: {
				1: pixelToRem(1),
				1.25: pixelToRem(1.25),
				1.5: pixelToRem(1.5),
				1.75: pixelToRem(1.75),
				2: pixelToRem(2),
			},
			borderWidth: {
				DEFAULT: pixelToRem(1),
				0: "0px",
				2: pixelToRem(2),
				4: pixelToRem(4),
				8: pixelToRem(8),
			},
			ringOffsetWidth: {
				0: "0px",
				1: pixelToRem(1),
				2: pixelToRem(2),
				4: pixelToRem(4),
				8: pixelToRem(8),
			},
			ringWidth: {
				DEFAULT: pixelToRem(3),
				0: "0px",
				1: pixelToRem(1),
				2: pixelToRem(2),
				4: pixelToRem(4),
				8: pixelToRem(8),
			},
			screens: {
				ss: "360px",
				xs: "480px",
			},
			spacing: {
				px: "0.0625rem",
				4.5: "1.125rem",
			},
			container: {
				center: true,
				screens: {
					xs: "480px",
					sm: "640px",
					md: "768px",
					lg: "1024px",
					xl: "1280px",
				},
			},
			fontFamily: {
				sans: [
					"Emoji",
					"Inter",
					"-apple-system",
					"BlinkMacSystemFont",
					"Roboto",
					"Helvetica",
					"sans-serif",
				],
			},
			keyframes: {
				"collapsible-down": {
					from: { height: 0 },
					to: { height: "var(--radix-collapsible-content-height)" },
				},
				"collapsible-up": {
					from: { height: "var(--radix-collapsible-content-height)" },
					to: { height: 0 },
				},
			},
			animation: {
				"collapsible-down":
					"collapsible-down 0.2s cubic-bezier(0.165,0.84,0.44,1)",
				"collapsible-up": "collapsible-up 0.2s cubic-bezier(0.165,0.84,0.44,1)",
			},
			transitionTimingFunction: {
				"in-quad": "cubic-bezier(0.55,0.085,0.68,0.53)",
				"in-cubic": "cubic-bezier(0.55,0.055,0.675,0.19)",
				"in-quart": "cubic-bezier(0.895,0.03,0.685,0.22)",
				"in-quint": "cubic-bezier(0.755,0.05,0.855,0.06)",
				"in-expo": "cubic-bezier(0.95,0.05,0.795,0.035)",
				"in-circ": "cubic-bezier(0.6,0.04,0.98,0.335)",
				"out-quad": "cubic-bezier(0.25,0.46,0.45,0.94)",
				"out-cubic": "cubic-bezier(0.215,0.61,0.355,1)",
				"out-quart": "cubic-bezier(0.165,0.84,0.44,1)",
				"out-quint": "cubic-bezier(0.23,1,0.32,1)",
				"out-expo": "cubic-bezier(0.19,1,0.22,1)",
				"out-circ": "cubic-bezier(0.075,0.82,0.165,1)",
				"in-out-quad": "cubic-bezier(0.455,0.03,0.515,0.955)",
				"in-out-cubic": "cubic-bezier(0.645,0.045,0.355,1)",
				"in-out-quart": "cubic-bezier(0.77,0,0.175,1)",
				"in-out-quint": "cubic-bezier(0.86,0,0.07,1)",
				"in-out-expo": "cubic-bezier(1,0,0,1)",
				"in-out-circ": "cubic-bezier(0.785,0.135,0.15,0.86)",
			},
			colors: {
				code: {
					white: "#EDEDED",
					blue: "#52A8FF",
					yellow: "#DCDCAA",
					green: "#5EB26D",
				},
				white: "#FFFFFF",
				black: "#000000",
				stone: {
					50: "#EBEBEB",
					100: "#D6D6D6",
					200: "#ABABAB",
					300: "#828282",
					400: "#575757",
					500: "#2D2D2D",
					600: "#242424",
					700: "#1C1C1C",
					800: "#121212",
					900: "#0A0A0A",
					950: "#050505",
				},
				green: {
					50: "#DBFFEA",
					100: "#B3FFD1",
					200: "#6BFFA6",
					300: "#1FFF78",
					400: "#00D154",
					500: "#008736",
					600: "#006B2B",
					700: "#005221",
					800: "#003816",
					900: "#00190A",
					950: "#000F06",
				},
				red: {
					50: "#FAEAEA",
					100: "#F6D5D5",
					200: "#ECA7A7",
					300: "#E27E7E",
					400: "#D95454",
					500: "#CB2D2D",
					600: "#A32424",
					700: "#791B1B",
					800: "#4F1212",
					900: "#2A0909",
					950: "#150505",
				},
				orange: {
					50: "#FFF7EB",
					100: "#FEEED7",
					200: "#FDDCAA",
					300: "#FCCB82",
					400: "#FBBB5B",
					500: "#FAA92F",
					600: "#EA8F06",
					700: "#AE6A04",
					800: "#734603",
					900: "#3C2401",
					950: "#1E1201",
				},
			},
		},
	},
};
