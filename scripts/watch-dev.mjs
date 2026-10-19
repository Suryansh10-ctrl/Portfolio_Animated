import { spawn } from "child_process";
import { watch } from "fs";
import { resolve } from "path";

function buildPortfolio() {
  console.log("⚡ Rebuilding 3D shelf assets from content/portfolio.json...");
  return spawn("node", ["scripts/build-portfolio-html.mjs"], { stdio: "inherit" });
}

// Initial build before starting Next.js
const initialBuild = buildPortfolio();

initialBuild.on("close", (code) => {
  if (code !== 0) {
    console.error("❌ Failed initial portfolio build with code", code);
    process.exit(code);
  }

  console.log("🚀 Starting Next.js development server...");
  const nextDev = spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true });

  let debounceTimer = null;
  const portfolioPath = resolve("content/portfolio.json");

  try {
    watch(portfolioPath, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log("\n📁 content/portfolio.json changed! Automatically rebuilding 3D shelf assets...");
        buildPortfolio();
      }, 200);
    });
    console.log("👀 Watching content/portfolio.json for real-time changes.\n");
  } catch (err) {
    console.warn("Watcher warning:", err.message);
  }

  process.on("SIGINT", () => {
    nextDev.kill();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    nextDev.kill();
    process.exit(0);
  });
});
