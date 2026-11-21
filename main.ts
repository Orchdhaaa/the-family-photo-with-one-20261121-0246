// Family photo v3 entry program.
// Writes the shipped entry image to the output directory, byte for byte.
// Shipped entry image sha256: fe329b5e68f83972fc9c4ece2edc8e31a840f84407a391120bad70c3bc9a76bc
// No network, no environment dependency beyond the output directory,
// no randomness: the output is always identical to the shipped file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const bytes = readFileSync(join(here, "entry.png"));
const outPath = join(outDir, "entry.png");
writeFileSync(outPath, bytes);
const written = readFileSync(outPath);
if (written.length !== bytes.length) {
  throw new Error(`output byte length mismatch: wrote ${written.length}, expected ${bytes.length}`);
}
