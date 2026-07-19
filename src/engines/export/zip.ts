export function createZip(
  files: Array<{ name: string; content: Uint8Array | string }>,
): Blob {
  const encoder = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(data);
    const size = data.length;

    // ── Local file header ──
    const header = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(header.buffer, header.byteOffset, header.byteLength);
    dv.setUint32(0, 0x04034b50, true);  // signature
    dv.setUint16(4, 20, true);          // version needed
    dv.setUint16(6, 0, true);           // flags
    dv.setUint16(8, 0, true);           // method (STORE)
    dv.setUint16(10, 0, true);          // mod time
    dv.setUint16(12, 0, true);          // mod date
    dv.setUint32(14, crc, true);        // crc32
    dv.setUint32(18, size, true);       // compressed size
    dv.setUint32(22, size, true);       // uncompressed size
    dv.setUint16(26, nameBytes.length, true); // filename length
    dv.setUint16(28, 0, true);          // extra field length
    header.set(nameBytes, 30);

    parts.push(header, data);

    // ── Central directory entry ──
    const entry = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(entry.buffer, entry.byteOffset, entry.byteLength);
    cdv.setUint32(0, 0x02014b50, true);  // signature
    cdv.setUint16(4, 20, true);          // version made by
    cdv.setUint16(6, 20, true);          // version needed
    cdv.setUint16(8, 0, true);           // flags
    cdv.setUint16(10, 0, true);          // method (STORE)
    cdv.setUint16(12, 0, true);          // mod time
    cdv.setUint16(14, 0, true);          // mod date
    cdv.setUint32(16, crc, true);        // crc32
    cdv.setUint32(20, size, true);       // compressed size
    cdv.setUint32(24, size, true);       // uncompressed size
    cdv.setUint16(28, nameBytes.length, true); // filename length
    cdv.setUint16(30, 0, true);          // extra field length
    cdv.setUint16(32, 0, true);          // file comment length
    cdv.setUint16(34, 0, true);          // disk number start
    cdv.setUint16(36, 0, true);          // internal file attributes
    cdv.setUint32(38, 0, true);          // external file attributes
    cdv.setUint32(42, offset, true);     // relative offset of local header
    entry.set(nameBytes, 46);

    central.push(entry);
    offset += header.length + size;
  }

  // ── Central directory ──
  const centralDir = concatUint8(central);
  const centralSize = centralDir.length;
  const centralOffset = offset;

  // ── End of central directory ──
  const eocd = new Uint8Array(22);
  const eocdDv = new DataView(eocd.buffer, eocd.byteOffset, eocd.byteLength);
  eocdDv.setUint32(0, 0x06054b50, true);  // signature
  eocdDv.setUint16(4, 0, true);           // disk number
  eocdDv.setUint16(6, 0, true);           // disk of central dir
  eocdDv.setUint16(8, files.length, true);// entries on this disk
  eocdDv.setUint16(10, files.length, true);// total entries
  eocdDv.setUint32(12, centralSize, true); // size of central directory
  eocdDv.setUint32(16, centralOffset, true); // offset of central directory
  eocdDv.setUint16(20, 0, true);          // comment length

  parts.push(centralDir, eocd);
  return new Blob(parts, { type: "application/zip" });
}

function concatUint8(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const arr of arrays) {
    result.set(arr, pos);
    pos += arr.length;
  }
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
