import fs from 'fs'
import crypto from 'crypto'
import appRootPath from 'app-root-path';
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config();

// Known checksums for files
const getFilePath = (fileName) => resolve(appRootPath.toString(), 'libs', fileName);

const files = [
  { path: getFilePath('dngconverter.exe'), checksum: process.env.DNG_CONVERTER_CHECKSUM },
];

function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });

}


describe('File Integrity Check', () => {
  files.forEach(({ path, checksum }) => {    
    test(`Checksum for ${path} matches`, async () => {
      const calculatedChecksum = await calculateChecksum(path);
      expect(calculatedChecksum).toBe(
        checksum,
        `Checksum mismatch for ${path}. Expected: ${checksum}, Got: ${calculatedChecksum}`
      );
    });
  });
});


