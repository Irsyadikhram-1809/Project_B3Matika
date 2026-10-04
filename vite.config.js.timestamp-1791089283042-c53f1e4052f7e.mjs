// vite.config.js
import { defineConfig } from "file:///C:/laragon/www/b3matika/node_modules/vite/dist/node/index.js";
import react from "file:///C:/laragon/www/b3matika/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/laragon/www/b3matika/vite.config.js";
var vite_config_default = defineConfig({
  // Entry point: index.html di root project
  root: ".",
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./resources/js", __vite_injected_original_import_meta_url)) }
  },
  build: {
    // Output hasil build ke dist/ (yang akan di-serve Vercel)
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxiM21hdGlrYVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcbGFyYWdvblxcXFx3d3dcXFxcYjNtYXRpa2FcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L2xhcmFnb24vd3d3L2IzbWF0aWthL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLy8gRW50cnkgcG9pbnQ6IGluZGV4Lmh0bWwgZGkgcm9vdCBwcm9qZWN0XG4gIHJvb3Q6ICcuJyxcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHsgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL2pzJywgaW1wb3J0Lm1ldGEudXJsKSkgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBPdXRwdXQgaGFzaWwgYnVpbGQga2UgZGlzdC8gKHlhbmcgYWthbiBkaS1zZXJ2ZSBWZXJjZWwpXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStQLFNBQVMsb0JBQW9CO0FBQzVSLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUYrSCxJQUFNLDJDQUEyQztBQUk5TSxJQUFPLHNCQUFRLGFBQWE7QUFBQTtBQUFBLEVBRTFCLE1BQU07QUFBQSxFQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPLEVBQUUsS0FBSyxjQUFjLElBQUksSUFBSSxrQkFBa0Isd0NBQWUsQ0FBQyxFQUFFO0FBQUEsRUFDMUU7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
