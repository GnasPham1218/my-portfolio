import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Trang chạy ở tên miền riêng https://gnaspham1218.dev nên base là gốc "/"
  base: "/",
  plugins: [react(), tailwindcss()],
});
