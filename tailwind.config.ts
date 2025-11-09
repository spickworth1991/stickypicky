import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",       // deep navy
        card: "#0F1A2B",     // card surface
        fg: "#E6F1FF",       // primary text
        muted: "#9FB1C7",    // secondary text
        cyan: "#19E3FF",     // electric cyan
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)",
      },
    },
  },
plugins: [require('@tailwindcss/typography')],

};
export default config;
