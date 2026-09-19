import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#12060F",
          surface: "#1E0C1B",
          accent: "#C9184A",
          accentSoft: "#FF4D6D",
          text: "#F5E6EC",
          muted: "#B48A99",
        },
      },
    },
  },
  plugins: [],
};

export default config;
