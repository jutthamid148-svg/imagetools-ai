import { cloudflare } from "@cloudflare/vite-plugin";
import { whop } from "@whop/cli/vite";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig } from "vite";

function collectHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === "dist" ||
      name === "public" ||
      name === ".git"
    ) {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collectHtml(full, acc);
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const htmlInput = Object.fromEntries(
  collectHtml(process.cwd()).map((file) => {
    const rel = relative(process.cwd(), file).replace(/\\/g, "/");
    const key = rel.replace(/\.html$/, "").replace(/\//g, "-") || "index";
    return [key, file];
  }),
);

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: "server" } }), whop()],
  appType: "mpa",
  environments: {
    client: {
      build: {
        outDir: "dist/client",
        rollupOptions: {
          input: htmlInput,
        },
      },
    },
    server: {
      build: {
        outDir: "dist/server",
      },
    },
  },
});
