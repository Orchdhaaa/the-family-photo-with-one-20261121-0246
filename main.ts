// Family Photo v2: writes the entry photograph to /output/entry.png.
// The photograph is the file entry.png shipped beside this program.
// Its sha256 is 9e3453e1925c9721e5ec0706ed673e56a3cb7194e27c1b1273f1ab5b85202c08,
// 168529 bytes, 1024x1024 JPEG.
// The program copies its bytes deterministically: no network, no
// environment input, and no randomness, so every run writes the
// same bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_FILE = "entry.png";
const OUTPUT_DIR = "/output";

const here = dirname(fileURLToPath(import.meta.url));
const bytes = readFileSync(join(here, IMAGE_FILE));
mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, IMAGE_FILE), bytes);
