#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function checkPng(filePath) {
  const buf = fs.readFileSync(filePath);
  // PNG signature
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  if (!buf.slice(0,8).equals(sig)) return { ok: false, reason: 'not-png' };

  let offset = 8;
  while (offset < buf.length) {
    if (offset + 8 > buf.length) return { ok: false, reason: 'truncated' };
    const len = buf.readUInt32BE(offset); offset += 4;
    const type = buf.slice(offset, offset+4); offset += 4;
    if (offset + len + 4 > buf.length) return { ok: false, reason: 'truncated' };
    const data = buf.slice(offset, offset+len); offset += len;
    const storedCrc = buf.readUInt32BE(offset); offset += 4;

    const calc = crc32(Buffer.concat([type, data]));
    if (calc !== storedCrc >>> 0) {
      return { ok: false, reason: 'crc-mismatch', chunk: type.toString('ascii'), storedCrc, calc };
    }

    if (type.toString('ascii') === 'IEND') break;
  }

  return { ok: true };
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else cb(p);
  }
}

function main() {
  const start = process.argv[2] || '.';
  const abs = path.resolve(process.cwd(), start);
  if (!fs.existsSync(abs)) {
    console.error('Path not found:', abs);
    process.exit(2);
  }

  const bad = [];
  walk(abs, p => {
    const lower = p.toLowerCase();
    if (lower.endsWith('.png')) {
      try {
        const res = checkPng(p);
        if (!res.ok) bad.push({ file: p, info: res });
      } catch (err) {
        bad.push({ file: p, info: { ok: false, reason: 'exception', message: String(err) } });
      }
    }
  });

  if (bad.length === 0) {
    console.log('No PNG CRC errors found.');
    return;
  }

  console.log('Found PNG problems:');
  for (const b of bad) {
    console.log('-', b.file);
    console.log('   ', b.info);
  }
  process.exit(1);
}

main();
