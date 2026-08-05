import * as esbuild from "esbuild";
import { readFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "preview/dist");
mkdirSync(out, { recursive: true });

// 1. Bundle the app, redirecting Next-only imports to the local shims.
await esbuild.build({
  entryPoints: ["preview/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  // Dependencies that touch `process` at module scope would otherwise throw
  // in the browser, taking the whole bundle down at startup.
  banner: { js: "globalThis.process=globalThis.process||{env:{}};" },
  alias: {
    "next/dynamic": path.join(root, "preview/next-dynamic.ts"),
    "next/link": path.join(root, "preview/next-link.ts"),
    "next/image": path.join(root, "preview/next-image.ts"),
  },
  loader: { ".tsx": "tsx", ".ts": "ts" },
  outfile: "preview/dist/app.js",
  logLevel: "info",
});

// 2. Build the stylesheet with the Tailwind CLI.
execSync(
  `npx @tailwindcss/cli -i src/app/globals.css -o preview/dist/app.css --minify`,
  { stdio: "inherit" },
);

console.log("bundled:", (readFileSync("preview/dist/app.js").length / 1024).toFixed(0) + "kb js,",
  (readFileSync("preview/dist/app.css").length / 1024).toFixed(0) + "kb css");
