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

// Renders the SafarCraft mark: deep emerald rounded-square with a cream
// journey path (gentle S-curve) and a warm gold waypoint at its end.
function renderIcon(size) {
  // Build raw RGBA pixel data.
  const raw = Buffer.alloc(size * size * 4);
  const corner = size * 0.22;
  const thickness = size * 0.075;

  // Journey path: cubic bezier from lower-left to upper-right with a gentle S-curve.
  const p0 = { x: size * 0.28, y: size * 0.74 };
  const p1 = { x: size * 0.30, y: size * 0.36 };
  const p2 = { x: size * 0.70, y: size * 0.64 };
  const p3 = { x: size * 0.72, y: size * 0.26 };

  const samples = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
    samples.push({ x, y });
  }

  function insideRounded(x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    const minX = corner, maxX = size - corner, minY = corner, maxY = size - corner;
    if (x >= minX && x <= maxX) return true;
    if (y >= minY && y <= maxY) return true;
    const dx = x < minX ? minX - x : x - maxX;
    const dy = y < minY ? minY - y : y - maxY;
    return dx * dx + dy * dy <= corner * corner;
  }

  function distToPath(x, y) {
    let best = Infinity;
    for (const s of samples) {
      const d = (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y);
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let r, g, b, a;
      if (insideRounded(x, y)) {
        // Gradient: deep emerald (#14573f) -> journey green (#1c7f63)
        const t = (x + y) / (size * 2);
        r = Math.round(20 + (28 - 20) * t);
        g = Math.round(87 + (127 - 87) * t);
        b = Math.round(63 + (99 - 63) * t);
        a = 255;

        const d = distToPath(x, y);
        const dw = Math.hypot(x - p3.x, y - p3.y);
        if (d <= thickness / 2) {
          // Warm cream stroke
          r = 250; g = 245; b = 233;
        }
        if (dw <= size * 0.075) {
          // Gold waypoint at the journey's next step
          r = 232; g = 163; b = 61;
        }
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