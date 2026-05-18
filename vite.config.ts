import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"

export default defineConfig({
  root: "examples/playground",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@tolipovjs/rich-text/styles.css",
        replacement: resolve(__dirname, "src/styles/editor.css"),
      },
      {
        find: "@tolipovjs/rich-text",
        replacement: resolve(__dirname, "src/index.ts"),
      },
    ],
  },
  server: {
    port: 5173,
    open: false,
  },
})
