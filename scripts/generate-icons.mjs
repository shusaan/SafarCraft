// Generate solid-color gradient PNG icons for the PWA manifest and favicon.
// Uses Node's built-in zlib + manual PNG encoding so we don't need an extra dep.
// Output: public/icon-192.png, public/icon-512.png, public/favicon.ico (32x32),
//         public/apple-touch-icon.png (180x180)
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { Buffer } from "node:buffer";

function crc32(buf) {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = (table[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

// Renders a soft violet->indigo gradient with a centred sparkles-style "C" glyph.
function renderIcon(size) {
  // Build raw RGBA pixel data.
  const raw = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.48;
  const innerRadius = radius * 0.62;
  // Glyph path (centred "C"): outer arc + inner arc carve
  const glyphCenter = { x: cx, y: cy };
  const glyphOuter = size * 0.30;
  const glyphThickness = size * 0.085;
  const glyphInner = glyphOuter - glyphThickness;
  const glyphStart = Math.PI * 0.18;
  const glyphEnd = Math.PI * (2 - 0.18);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      let r, g, b, a;
      if (dist <= radius) {
        // Gradient: top-left violet (#8b5cf6 ~ rgb(139,92,246)) -> bottom-right indigo (#6366f1 ~ rgb(99,102,241))
        const t = ((x + y) / (size * 2));
        r = Math.round(139 + (99 - 139) * t);
        g = Math.round(92 + (102 - 92) * t);
        b = Math.round(246 + (241 - 246) * t);
        a = 255;

        // Carve the "C" glyph: between outer and inner radii within the arc range.
        if (dist >= glyphInner && dist <= glyphOuter && angle >= glyphStart && angle <= glyphEnd) {
          r = 255; g = 255; b = 255; a = 255;
        }
        // Soft round edge for the badge background
        const edgeFade = Math.max(0, 1 - (dist - radius * 0.97) / (radius * 0.03));
        a = Math.round(255 * Math.min(1, edgeFade));
      } else {
        r = 0; g = 0; b = 0; a = 0;
      }
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }

  // Encode PNG.
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Add filter byte (0 = none) per scanline.
  const stride = size * 4;
  const filtered = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    filtered[y * (stride + 1)] = 0;
    raw.copy(filtered, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = deflateRawSync(filtered);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Minimal ICO writer that wraps a single 32x32 PNG (modern browsers accept PNG inside ICO).
function makeIco(pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type 1 = ICO
  header.writeUInt16LE(1, 4);     // image count
  const entry = Buffer.alloc(16);
  entry[0] = 32;                  // width
  entry[1] = 32;                  // height
  entry[2] = 0;                   // colour palette
  entry[3] = 0;                   // reserved
  entry.writeUInt16LE(1, 4);      // colour planes
  entry.writeUInt16LE(32, 6);     // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);    // offset = 6 + 16
  return Buffer.concat([header, entry, pngBuf]);
}

mkdirSync("public", { recursive: true });
writeFileSync("public/icon-192.png", renderIcon(192));
writeFileSync("public/icon-512.png", renderIcon(512));
writeFileSync("public/apple-touch-icon.png", renderIcon(180));
writeFileSync("public/favicon.ico", makeIco(renderIcon(32)));
console.log("Wrote icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico");