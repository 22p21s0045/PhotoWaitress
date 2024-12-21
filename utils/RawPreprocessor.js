import { spawn } from "child_process";
import { resolve } from "path";
import fs from 'fs';
import appRootPath from "app-root-path";
import ora from "ora";
import chalk from "chalk";
export class RawPreprocessor {
  constructor(directoryPath) {
    this.directoryPath = directoryPath;
  }

  // Helper function to wrap the spawn process in a Promise
  async runProcess(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'inherit' });

      process.on('error', (err) => {
        reject(`Failed to start process: ${err.message}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();  // Process completed successfully
        } else {
          reject(`Process failed with exit code: ${code}`);
        }
      });
    });
  }

  async convertToDng() {
    const spinner = ora('Converting all images to DNG format for preprocessing ...').start();
    const __rootProject = appRootPath.toString();

    const dngOutDirectory = resolve(__rootProject, "img", "dngOut");
    const inputDirectory = resolve(__rootProject, "img", "input");

    const dngConverter = resolve(__rootProject, "libs", "dngconverter.exe");

    // Set option full resolution, multiple file processing, and output directory
    const args = ["-p2", "-fl", "-d", dngOutDirectory];

    try {
      const files = fs.readdirSync(inputDirectory);

      // Add each file to args
      files.forEach((file) => {
        const fullPath = resolve(inputDirectory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
          args.push(fullPath);
        }
      });

      console.log("Arguments:", args);

      // Wait for the DNG conversion process to complete
      await this.runProcess(dngConverter, args);

      spinner.succeed('DNG conversion completed successfully!');
      console.log("DNG conversion completed successfully!");

    } catch (err) {
      spinner.fail('DNG conversion failed');
      console.error(`Error processing files in ${inputDirectory}:`, err.message);
    }
  }


   // Method to initialize required folders
   initializeFolders(folderStructure) {
    folderStructure.forEach((folderPath) => {
      if (!fs.existsSync(folderPath)) {
        try {
          fs.mkdirSync(folderPath, { recursive: true });
          console.log(`Folder created: ${folderPath}`);
        } catch (err) {
          console.error(`Failed to create folder: ${folderPath}`, err.message);
          throw err; // Re-throw to allow calling code to handle it
        }
      }
    });
  }

  async setupProjectStructure() {
    const __rootProject = appRootPath.toString();

    const folderPaths = [
      resolve(__rootProject, "img", "dngOut"),
      resolve(__rootProject, "img", "input"),
      resolve(__rootProject, "img", "output", "processed", "goodExposure"),
      resolve(__rootProject, "img", "output", "processed", "overExposure"),
      resolve(__rootProject, "img", "output", "processed", "underExposure"),
      resolve(__rootProject, "img", "presets"),
      resolve(__rootProject, "img", "temp", "goodExposure"),
      resolve(__rootProject, "img", "temp", "overExposure"),
      resolve(__rootProject, "img", "temp", "underExposure"),
      resolve(__rootProject, "archives")
    ];

    this.initializeFolders(folderPaths);

    console.log(chalk.green("✔ Project structure initialized successfully!"));
  }
}
