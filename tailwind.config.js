/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-indigo-700', 'bg-emerald-700',
    'shadow-indigo-950/20', 'shadow-emerald-950/20',
    'bg-indigo-600', 'bg-emerald-600',
    'hover:bg-indigo-500', 'hover:bg-emerald-500',
    'text-indigo-400', 'text-emerald-400',
    'text-indigo-300', 'text-emerald-300',
    'border-indigo-500', 'border-emerald-500',
    'border-indigo-400', 'border-emerald-400',
    'bg-indigo-500', 'bg-emerald-500',
    'bg-indigo-950/40', 'bg-emerald-950/40',
    'hover:text-indigo-400', 'hover:text-emerald-400',
    'focus:border-indigo-500', 'focus:border-emerald-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
