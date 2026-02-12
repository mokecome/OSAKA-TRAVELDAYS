/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './server.js',
  ],
  theme: {
    extend: {
      colors: {
        // admin.html custom colors
        sidebar: '#1a1a1a',
        surface: '#f6f6f7',
        card: '#ffffff',
        primary: '#008060',
        'primary-hover': '#006e52',
        destructive: '#d72c0d',
        'destructive-hover': '#bc2200',
        link: '#2c6ecb',
        'text-primary': '#202223',
        'text-secondary': '#6d7175',
        'text-disabled': '#8c9196',
        'border-default': '#e1e3e5',
        'border-subdued': '#eaecee',
        'icon-default': '#5c5f62',
        'surface-selected': '#f2f7fe',
        'surface-hover': '#f1f2f3',
      }
    }
  },
  plugins: [],
}
