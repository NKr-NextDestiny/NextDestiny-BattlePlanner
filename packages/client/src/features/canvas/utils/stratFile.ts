/**
 * NextDestiny Strat (.nds) file export / import.
 *
 * Binary format:
 *   [4B] Magic "NDS\x01"  [4B] Flags  [4B] Payload Size  [4B] CRC32
 *   [NB] gzip-compressed JSON payload
 *
 * Uses the browser's native CompressionStream/DecompressionStream API.
 */

import type { NdsPayload } from '@nd-battleplanner/shared';
import { NDS_MAGIC, NDS_HEADER_SIZE, NDS_FLAG_COMPRESSED } from '@nd-battleplanner/shared';

// ---------------------------------------------------------------------------
// CRC32 (standard polynomial 0xEDB88320)
// ---------------------------------------------------------------------------

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]!) & 0xFF]! ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ---------------------------------------------------------------------------
// Compress / Decompress via native streams
// ---------------------------------------------------------------------------

async function gzipCompress(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  let totalLen = 0;
  for (const c of chunks) totalLen += c.length;
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

async function gzipDecompress(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  let totalLen = 0;
  for (const c of chunks) totalLen += c.length;
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export async function exportNds(payload: NdsPayload, fileName: string): Promise<void> {
  const jsonStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(jsonStr);
  const checksum = crc32(rawBytes);

  const compressed = await gzipCompress(rawBytes);

  // Build header
  const header = new ArrayBuffer(NDS_HEADER_SIZE);
  const headerView = new DataView(header);
  // Magic
  for (let i = 0; i < 4; i++) headerView.setUint8(i, NDS_MAGIC.charCodeAt(i));
  // Flags (compressed)
  headerView.setUint32(4, NDS_FLAG_COMPRESSED, true);
  // Payload size (uncompressed)
  headerView.setUint32(8, rawBytes.length, true);
  // CRC32
  headerView.setUint32(12, checksum, true);

  // Combine header + compressed payload
  const file = new Uint8Array(NDS_HEADER_SIZE + compressed.length);
  file.set(new Uint8Array(header), 0);
  file.set(compressed, NDS_HEADER_SIZE);

  // Trigger download
  const blob = new Blob([file], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${fileName}.nds`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Import / Parse
// ---------------------------------------------------------------------------

export async function parseNds(file: File): Promise<NdsPayload> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  if (bytes.length < NDS_HEADER_SIZE) {
    throw new Error('Invalid .nds file: too small');
  }

  // Verify magic
  const magic = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
  if (magic !== NDS_MAGIC) {
    throw new Error('Invalid .nds file: bad magic bytes');
  }

  const view = new DataView(buf);
  const flags = view.getUint32(4, true);
  const payloadSize = view.getUint32(8, true);
  const expectedCrc = view.getUint32(12, true);

  const compressedPayload = bytes.slice(NDS_HEADER_SIZE);

  let rawBytes: Uint8Array;
  if (flags & NDS_FLAG_COMPRESSED) {
    rawBytes = await gzipDecompress(compressedPayload);
  } else {
    rawBytes = compressedPayload;
  }

  // Validate size
  if (rawBytes.length !== payloadSize) {
    throw new Error(`Invalid .nds file: payload size mismatch (expected ${payloadSize}, got ${rawBytes.length})`);
  }

  // Validate CRC32
  const actualCrc = crc32(rawBytes);
  if (actualCrc !== expectedCrc) {
    throw new Error('Invalid .nds file: CRC32 checksum mismatch (file may be corrupted)');
  }

  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(rawBytes);
  const payload: NdsPayload = JSON.parse(jsonStr);

  // Basic schema validation
  if (payload.version !== '1.0' || !payload.strat || !payload.game || !payload.map) {
    throw new Error('Invalid .nds file: unexpected payload structure');
  }

  return payload;
}
