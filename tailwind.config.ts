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
        // ธีมหลัก = น้ำเงินกรมท่า (navy) เข้ากับโลโก้แดงแบบคลาสสิก
        brand: {
          50: '#eff4fa',
          100: '#dbe6f4',
          200: '#bcd0e9',
          300: '#8fb0d8',
          400: '#5c88c1',
          500: '#3b6aa8',
          600: '#2d548c',
          700: '#274671',
          800: '#243c5f',
          900: '#213450',
          950: '#141f33',
        },
        // สีเน้น = แดง (ให้เข้ากับโลโก้ B.B.)
        accent: {
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
        // ทุก keyframe ใช้ transform ล้วน ไม่แตะ opacity (เนื้อหาต้องแสดงเสมอ)
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        marquee: 'marquee 26s linear infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
