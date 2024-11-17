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

  async process() {
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
            try {
              // Use ShellJS's mv() method for moving files
              const result = shell.mv(fullPath, __tempGood)

              if (result.code !== 0) {
                // If the mv command fails, log an error
                console.error(`Error: Failed to move file. ${result.stderr}`)
              } else {
                this.goodExposureCount += 1

                // If successful, log the success message
                console.log("File moved successfully")
              }

              // Continue with the next iteration if required
              continue
            } catch (error) {
              // Catch any errors that occur
              console.error(`Error: ${error.message}`)
            }

          case -1:
            try {
              // Use ShellJS's mv() method for moving files
              const result = shell.mv(fullPath, __tempUnder)

              if (result.code !== 0) {
                // If the mv command fails, log the error
                console.error(`Error: Failed to move file. ${result.stderr}`)
              } else {
                this.underExposureCount += 1
                // If successful, log the success message
                console.log("File moved successfully")
              }

              // Continue with the next iteration
              continue
            } catch (error) {
              // Catch any unexpected errors
              console.error(`Error: ${error.message}`)
            }
          case 1:
            try {
              // Use ShellJS's mv() method for moving files
              const result = shell.mv(fullPath, __tempOver)

              if (result.code !== 0) {
                // If the mv command fails, log the error
                console.error(`Error: Failed to move file. ${result.stderr}`)
              } else {
                this.overExposureCount += 1
                // If successful, log the success message
                console.log("File moved successfully")
              }

              // Continue with the next iteration
              continue
            } catch (error) {
              // Catch any unexpected errors
              console.error(`Error: ${error.message}`)
            }
        }
      }
      spinner.succeed()
    } catch (Error) {
      spinner.fail()
    }
  }
}
