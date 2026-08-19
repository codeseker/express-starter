import "reflect-metadata";
import fs from "fs";
import path from "path";

function getAllFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      results.push(...getAllFiles(full, ext));
    } else if (entry.name.endsWith(ext) && !entry.name.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Auto-discover every @Component and @Primary class by importing all
 * source files. Decorators fire on import and register in the Container.
 */
export function scanComponents(): void {
  const rootDir = path.resolve(__dirname, "..");
  const scanExt = __dirname.includes("dist") ? ".js" : ".ts";

  const files = getAllFiles(rootDir, scanExt).filter((f) => {
    if (f.endsWith(".d.ts") || f.endsWith(".d.js")) return false;
    if (f.includes("container.scan")) return false;
    if (f.includes("seeder")) return false;
    if (f.endsWith("server" + scanExt)) return false;
    return true;
  });

  const failed: string[] = [];

  for (const file of files) {
    try {
      // Use require() — works on Windows with absolute paths in CommonJS.
      // await import() fails on Windows because it needs file:// URLs.
      require(file);
    } catch (err: any) {
      failed.push(path.relative(rootDir, file) + " -> " + (err.message || err));
    }
  }

  if (failed.length) {
    console.log("Failed imports (" + failed.length + "):");
    failed.forEach((f) => console.log("  " + f));
  }

  console.log(
    "Scanned " + files.length + " files (" + (files.length - failed.length) + " ok)."
  );
}
