// main.ts — the-family-photo-with-one-20261121-0246 entrypoint.
//
// The entry is a single photograph (entry.png): a family at home in the
// kitchen with one machine member, a small domestic robot caught mid-task
// peeling a carrot at the counter. This program copies it byte for byte
// into the output directory, then reads the copy back and checks it
// matches, so every run writes exactly the same bytes.
//
// No network is used at run time; everything the program needs ships in
// this repo.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(scriptDir, "entry.png");

// make.fun runs the program with MAKEFUN_OUTPUT_DIR set; default to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.png");

const image = readFileSync(sourcePath);
if (image.length === 0) {
  throw new Error("bundled image is empty");
}
// The gate refuses anything over 1 MiB, so fail here rather than shipping it.
if (image.length > 1048576) {
  throw new Error(`bundled image too large: ${image.length} bytes`);
}

// The gate tells PNG from JPEG by the first bytes, so refuse anything else
// here instead of shipping a file the gate would reject.
const isPng = image.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
const isJpeg = image.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
if (!isPng && !isJpeg) {
  throw new Error("bundled image is neither PNG nor JPEG");
}

// The gate also refuses images over 1024 by 1024 pixels, so read the
// dimensions from the headers (PNG IHDR or JPEG SOF marker) and refuse
// anything larger here instead of shipping a file the gate would reject.
function imageDimensions(buf: Buffer): { width: number; height: number } {
  if (isPng) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) throw new Error("corrupt JPEG marker");
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("no JPEG SOF marker found");
}
const dims = imageDimensions(image);
if (dims.width > 1024 || dims.height > 1024) {
  throw new Error(`bundled image too large: ${dims.width}x${dims.height}`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, image);

// Verify the write so a truncated or altered copy fails loudly instead of
// silently submitting different bytes.
const written = readFileSync(outputPath);
if (!image.equals(written)) {
  throw new Error("output does not match the bundled image");
}

console.log(`wrote ${outputPath} (${written.length} bytes, verified)`);
