import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages のプロジェクトページ (https://coiluck.github.io/CountryChain/) 用
  base: '/CountryChain/',
  plugins: [tailwindcss()],
});
