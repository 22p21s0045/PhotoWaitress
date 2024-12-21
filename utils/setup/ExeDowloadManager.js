import axios from "axios"
import fs from "fs"
import fsPromises from "fs/promises";
import { SingleBar, Presets } from 'cli-progress';
import dotenv from 'dotenv'
import appRootPath from "app-root-path"
import { resolve } from "path"
import path from "path";
import { createHash } from 'crypto';
import chalk from "chalk";
dotenv.config()
export class ExeDowloadManager {


   /**
    * The function `getFile` asynchronously downloads a file from a given URL, tracks the download
    * progress with a progress bar, and saves the file to a specified directory with the provided
    * filename.
    * @param url - The `url` parameter in the `getFile` function is the URL from which you want to
    * download a file. It is the source location of the file you want to retrieve.
    * @param directory - The `directory` parameter in the `getFile` function represents the directory
    * where the downloaded file will be saved. It is the location on the file system where the file
    * will be stored. For example, it could be a path like `/path/to/directory` where the file will be
    * saved as `/
    * @param filename - The `filename` parameter in the `getFile` function represents the name that you
    * want to give to the downloaded file. It is the name by which the file will be saved in the
    * specified `directory`. For example, if you want to download a file from a given `url` and save it
    * @returns The `getFile` function returns a Promise that resolves with the file path where the
    * downloaded file is saved.
    */
    async getFile(url, directory, filename) {
      try {
        // Ensure the directory exists
        await fs.promises.mkdir(directory, { recursive: true });

        // Construct the full file path
        const filePath = path.join(directory, filename);

        // Initialize the progress bar
        const progressBar = new SingleBar({
            format: 'Downloading |{bar}| {percentage}% | {downloadedMB} MB/{totalMB} MB | Speed: {speed} MB/s',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
        }, Presets.shades_classic);

        // Get the file size from the HEAD request
        const { headers } = await axios.head(url);
        const totalSize = parseInt(headers['content-length'], 10);
        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

        // Start the progress bar
        progressBar.start(totalSize, 0, {
            downloadedMB: '0.00',
            totalMB,
            speed: '0.00',
        });

        // Make a GET request to download the file
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        // Create a write stream for the file
        const writer = fs.createWriteStream(filePath);

        // Track the downloaded bytes and time
        let downloadedSize = 0;
        const startTime = Date.now();

        // Pipe the response data to the file and update the progress bar
        response.data.on('data', (chunk) => {
            downloadedSize += chunk.length;
            const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
            const speed = (downloadedSize / (1024 * 1024)) / elapsedTime; // MB/s
            progressBar.update(downloadedSize, {
                downloadedMB: (downloadedSize / (1024 * 1024)).toFixed(2),
                speed: speed.toFixed(2),
            });
        });

        response.data.pipe(writer);

        // Wait for the writing process to complete
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                progressBar.stop();
                console.log(`File downloaded and saved to: ${filePath}`);
                resolve(filePath);
            });
            writer.on('error', (err) => {
                progressBar.stop();
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error downloading file:', error.message);
        throw error;
    }
      }

  /* The `async fileExists(path)` function is checking whether a file exists at the specified `path`.
  Here's a breakdown of what the function does: */
  async fileExists(path) {
    
    if(fs.existsSync(path)){
        return true
    }
    else{
        return false
    }
  }

  /**
   * The function `verifyChecksum` asynchronously calculates the SHA-256 checksum of a file and
   * compares it to an expected checksum.
   * @param filePath - The `filePath` parameter is the path to the file for which you want to verify
   * the checksum.
   * @param expectedChecksum - The `expectedChecksum` parameter is the checksum value that is expected
   * to match the computed checksum of the file located at the `filePath`. It is usually a
   * pre-calculated hash value (e.g., SHA-256) that is used to verify the integrity of the file.
   * @returns The function `verifyChecksum` is returning a boolean value indicating whether the
   * computed checksum of the file located at `filePath` matches the `expectedChecksum`.
   */
  async verifyChecksum(filePath, expectedChecksum) {
    const hash = createHash('sha256');
    const fileBuffer = await fs.promises.readFile(filePath);
    hash.update(fileBuffer);
    const computedChecksum = hash.digest('hex');
    
    return computedChecksum === expectedChecksum;
}

  

async setupDngConverter() {
  const __PATH_LIB = resolve(appRootPath.toString(), 'libs');
  const dngConverter_URL = process.env.DNG_CONVERTER_URL || "https://github.com/22p21s0045/PhotoWaitress/releases/download/alpha/dngconverter.exe";
  const expectedChecksum = process.env.DNG_CONVERTER_CHECKSUM;

  if (await this.fileExists(resolve(__PATH_LIB, 'dngconverter.exe'))) {
      const filePath = resolve(__PATH_LIB, 'dngconverter.exe');
      
      // Verify checksum
      const isValid = await this.verifyChecksum(filePath, expectedChecksum);
      if (isValid) {
        console.log(chalk.green("✔ DNG converter already exists."));
      } else {
         console.log(chalk.yellow("⚠️ Checksum is invalid. Redownloading the file..."));
          await this.getFile(dngConverter_URL, __PATH_LIB, 'dngconverter.exe');
      }
  } else {
      console.log('Downloading DNG converter...');
      await this.getFile(dngConverter_URL, __PATH_LIB, 'dngconverter.exe');
  }
}
}


// const manager = new ExeDowloadManager()
// manager.setupDngConverter()
