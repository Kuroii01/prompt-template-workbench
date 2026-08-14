import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 开发服务器把 /api 代理到后端 8001 端口，避免跨域配置
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
});
