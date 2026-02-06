/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // suas cores padronizadas
        'cept-blue': '#0056b3',
        'cept-orange': '#f39c12',
        'cept-green': '#27ae60',
        'cept-dark': '#1e293b', // cor para textos e títulos
      },
      fontFamily: {
        // definindo a inter como a fonte sans padrão do projeto
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}