export function createZip(
  files: Array<{ name: string; content: Uint8Array | string }>,
): Blob {
  const localHeaders: Uint8Array[] = [];
  const centralEntries: Uint8Array[] = [];
  let offset = 0;

  const encoder = new TextEncoder();

  for (const file of files) {
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(data);
    const compressed = data;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(localHeader.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint16(14, 0, true);
    dv.setUint32(16, 0, true);
    dv.setUint32(20, crc, true);
    dv.setUint32(24, compressed.length, true);
    dv.setUint32(28, compressed.length, true);
    localHeader.set(nameBytes, 30);

    localHeaders.push(localHeader, compressed);

    const centralEntry = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(centralEntry.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true);
    cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, compressed.length, true);
    cdv.setUint32(24, compressed.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint16(38, 0, true);
    cdv.setUint32(40, 0, true);
    cdv.setUint32(44, offset, true);
    centralEntry.set(nameBytes, 46);

    centralEntries.push(centralEntry);
    offset += localHeader.length + compressed.length;
  }

  const centralSize = centralEntries.reduce((s, e) => s + e.length, 0);
  const centralOffset = offset;

  const eocd = new Uint8Array(22);
  const eocdDv = new DataView(eocd.buffer);
  eocdDv.setUint32(0, 0x06054b50, true);
  eocdDv.setUint16(4, 0, true);
  eocdDv.setUint16(6, 0, true);
  eocdDv.setUint16(8, files.length, true);
  eocdDv.setUint16(10, files.length, true);
  eocdDv.setUint32(12, centralSize, true);
  eocdDv.setUint32(16, centralOffset, true);
  eocdDv.setUint16(20, 0, true);

  const allParts = [...localHeaders, ...centralEntries, eocd];
  const totalLength = allParts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }

  return new Blob([result], { type: "application/zip" });
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
