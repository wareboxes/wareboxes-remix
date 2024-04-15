// vite.config.ts
import { vitePlugin as remix } from "file:///home/deandre/projects/js-projects/wareboxes-remix/node_modules/@remix-run/dev/dist/index.js";
import { installGlobals } from "file:///home/deandre/projects/js-projects/wareboxes-remix/node_modules/@remix-run/node/dist/index.js";
import { defineConfig } from "file:///home/deandre/projects/js-projects/wareboxes-remix/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///home/deandre/projects/js-projects/wareboxes-remix/node_modules/vite-tsconfig-paths/dist/index.mjs";
installGlobals();
var vite_config_default = defineConfig({
  plugins: [remix(), tsconfigPaths()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9kZWFuZHJlL3Byb2plY3RzL2pzLXByb2plY3RzL3dhcmVib3hlcy1yZW1peFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZGVhbmRyZS9wcm9qZWN0cy9qcy1wcm9qZWN0cy93YXJlYm94ZXMtcmVtaXgvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZGVhbmRyZS9wcm9qZWN0cy9qcy1wcm9qZWN0cy93YXJlYm94ZXMtcmVtaXgvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgeyBpbnN0YWxsR2xvYmFscyB9IGZyb20gXCJAcmVtaXgtcnVuL25vZGVcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuXG5pbnN0YWxsR2xvYmFscygpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVtaXgoKSwgdHNjb25maWdQYXRocygpXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFTLGNBQWMsYUFBYTtBQUM1VyxTQUFTLHNCQUFzQjtBQUMvQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLG1CQUFtQjtBQUUxQixlQUFlO0FBRWYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFDcEMsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
