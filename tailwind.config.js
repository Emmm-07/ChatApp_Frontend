/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // All React files
  ],
  theme: {
    extend: { // ADD custom color 
        colors:{

        }
    },
  },
  plugins: [],
}

