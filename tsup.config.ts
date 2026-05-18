import { defineConfig } from "tsup"
import { copyFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  sourcemap: false,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  onSuccess: async () => {
    const dest = "dist/styles.css"
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync("src/styles/editor.css", dest)
    // eslint-disable-next-line no-console
    console.log("→ Copied styles.css to dist/")
  },
})
