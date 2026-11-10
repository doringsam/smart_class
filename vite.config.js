import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Vite 개발 서버 및 빌드 설정 파일입니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
