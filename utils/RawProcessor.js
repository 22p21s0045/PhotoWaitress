import { ExposureClassifier } from "./ExposureClassifier.js"
import { exec } from "child_process"
import { promises as fs } from "fs"
import shell from "shelljs"
import path, { resolve } from "path"
import ora from "ora"
import appRootPath from "app-root-path"
import chalk from 'chalk';
import { log } from "console"
export class RawProcessor {
  constructor(inputDir) {
    this.inputDir = inputDir
    this.appRootPath = appRootPath.toString()
    // Initialize counters for stats
    this.goodExposureCount = 0
    this.underExposureCount = 0
    this.overExposureCount = 0
  }

  logStats() {
    console.log(chalk.blue.bold("\n📊 --- Image Classification Statistics --- 📊"));
    console.log(chalk.green(`Number of good exposure images: ${this.goodExposureCount}`));
    console.log(chalk.yellow(`Number of under exposure images: ${this.underExposureCount}`));
    console.log(chalk.red(`Number of over exposure images: ${this.overExposureCount}`));
    
    const total = this.goodExposureCount + this.underExposureCount + this.overExposureCount;
    console.log(chalk.cyan.bold("\n--- Summary ---"));
    console.log(chalk.cyan(`Total images processed: ${total}`));
    console.log(chalk.green(`Percentage of good exposure images: ${(this.goodExposureCount / total * 100).toFixed(2)}%`));
    console.log(chalk.yellow(`Percentage of under exposure images: ${(this.underExposureCount / total * 100).toFixed(2)}%`));
    console.log(chalk.red(`Percentage of over exposure images: ${(this.overExposureCount / total * 100).toFixed(2)}%`));
    console.log(chalk.blue.bold("\n✨ Processing Complete! ✨\n"));
}

async moveFile(filePath, destination, counterType) {
    try {
      const result = shell.mv(filePath, destination);
      if (result.code !== 0) throw new Error(result.stderr);
      this[counterType]++;
      console.log(chalk.green(`✅ File moved to ${destination}`));
    } catch (error) {
      this.handleError(error, `Moving file to ${destination}`);
    }
  }
  
  async process({ applyPreset = false, presetPath = null, outputDir = null } = {}) {
    console.log(chalk.blue.bold("\n🚀 Starting processing workflow...\n"));
    
    // Step 1: Classify images based on exposure
    await this.processImageExposure();

    // Step 2: Apply preset (optional)
    if (applyPreset && presetPath) {
        console.log(chalk.blue("\n🎨 Applying preset to images...\n"));
        await this.applyPreset(presetPath, outputDir);
    }

    // Step 3: Log statistics
    this.logStats();
}


  async processImageExposure() {
    const spinner = ora("Classify your image with exposure").start()

    const __rootProject = appRootPath.toString()

    const __input = resolve(__rootProject, "img", "dngOut")

    const __tempGood = resolve(__rootProject, "img", "temp", "goodExposure")
    const __tempUnder = resolve(__rootProject, "img", "temp", "underExposure")
    const __tempOver = resolve(__rootProject, "img", "temp", "OverExposure")

    try {
      const dir = await fs.readdir(__input)

      for (let file of dir) {
        const fullPath = resolve(__input, file)

        const exposureClassifier = new ExposureClassifier(fullPath)

        switch (await exposureClassifier.analyzeImageExposure()) {
            case 0:
                await this.moveFile(fullPath, __tempGood, "goodExposureCount");
                continue;
              case -1:
                await this.moveFile(fullPath, __tempUnder, "underExposureCount");
                continue;
              case 1:
                await this.moveFile(fullPath, __tempOver, "overExposureCount");
                continue;
        }
      }
      spinner.succeed()
    } catch (Error) {
      spinner.fail()
    }
  }

  async applyPreset(presetPath, outputDir) {
    const spinner = ora("Applying preset to images...").start();
    const __rootProject = appRootPath.toString()
    const __inputRoot = resolve(__rootProject, "img", "temp");
    const __output = resolve(outputDir || this.inputDir, "processed");

    try {
        // Ensure output directory exists
        await fs.mkdir(__output, { recursive: true });

        // Subfolders within the "temp" directory
        const exposureFolders = ['goodExposure', 'overExposure', 'underExposure'];

        // Iterate through the subfolders
        for (const folder of exposureFolders) {
            const folderPath = resolve(__inputRoot, folder);
            const files = await fs.readdir(folderPath);

            for (let file of files) {
                const fullPath = resolve(folderPath, file);
                const outputPath = resolve(__output, folder, file);

                // Ensure the folder structure is preserved in the output directory
                await fs.mkdir(resolve(__output, folder), { recursive: true });

                // Example command for applying a preset using rawtherapee-cli
                const command = `rawtherapee-cli -q -Y -p "${presetPath}" -o "${outputPath}" -c "${fullPath}"`;

                const { stdout, stderr } = await exec(command);
                if (stderr) {
                    console.log(chalk.red(`Error processing file ${file}: ${stderr}`));
                } else {
                    console.log(chalk.green(`✅ Preset applied to ${file}: ${stdout}`));
                }
            }
        }

        spinner.succeed("Preset applied successfully!");
    } catch (error) {
        spinner.fail("Failed to apply preset.");
        this.handleError(error, "Applying preset to images");
    }
}




}
