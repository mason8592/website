import esbuild from "esbuild"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { dependencies } = require("./package.json")

const externalDeps = Object.keys(dependencies || {})

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: "../dist/backend/index.js",
  external: externalDeps, // Exclude all node_modules
}).catch(() => process.exit(1))
