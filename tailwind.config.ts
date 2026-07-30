import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // โทนสีแบรนด์ เบิ้มอะไหล่ยนต์ (แดงเข้มจากโลโก้ B.B.)
        brand: {
          50: '#fdf3f3',
          100: '#fbe4e4',
          200: '#f7cccc',
          300: '#efa8a8',
          400: '#e37676',
          500: '#d24b4b',
          600: '#b52f2f',
          700: '#961f1f',
          800: '#7d1d1d',
          900: '#6a1c1c',
          950: '#3a0b0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-thai)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(16px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        // ใช้ transform เท่านั้น ไม่แตะ opacity (กันรูปหายตอน JS ไม่ทำงาน)
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
