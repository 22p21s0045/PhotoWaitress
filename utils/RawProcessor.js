import { ExposureClassifier } from "./ExposureClassifier.js"
import { promises as fs } from "fs"
import shell from "shelljs"
import path, { resolve } from "path"
import ora from "ora"
import appRootPath from "app-root-path"
import chalk from "chalk"
import { execa } from "execa"
import AdmZip from "adm-zip"
import { nanoid } from "nanoid"
import { TempFileCleaner } from "./TempFileCleaner.js"
import {ImageDetailChecker} from './ImageDetailChecker.js'

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
    console.log(
      chalk.blue.bold("\n📊 --- Image Classification Statistics --- 📊")
    )
    console.log(
      chalk.green(`Number of good exposure images: ${this.goodExposureCount}`)
    )
    console.log(
      chalk.yellow(
        `Number of under exposure images: ${this.underExposureCount}`
      )
    )
    console.log(
      chalk.red(`Number of over exposure images: ${this.overExposureCount}`)
    )

    const total =
      this.goodExposureCount + this.underExposureCount + this.overExposureCount
    console.log(chalk.cyan.bold("\n--- Summary ---"))
    console.log(chalk.cyan(`Total images processed: ${total}`))
    console.log(
      chalk.green(
        `Percentage of good exposure images: ${(
          (this.goodExposureCount / total) *
          100
        ).toFixed(2)}%`
      )
    )
    console.log(
      chalk.yellow(
        `Percentage of under exposure images: ${(
          (this.underExposureCount / total) *
          100
        ).toFixed(2)}%`
      )
    )
    console.log(
      chalk.red(
        `Percentage of over exposure images: ${(
          (this.overExposureCount / total) *
          100
        ).toFixed(2)}%`
      )
    )
    console.log(chalk.blue.bold("\n✨ Processing Complete! ✨\n"))
  }



  async moveFile(filePath, destination, counterType) {
    try {
      const result = shell.mv(filePath, destination)
      if (result.code !== 0) throw new Error(result.stderr)
      this[counterType]++
      console.log(chalk.green(`✅ File moved to ${destination}`))
    } catch (error) {
      this.handleError(error, `Moving file to ${destination}`)
    }
  }

  async process({
    applyPreset = false,
    presetPath = null,
    outputDir = null,
  } = {}) {
    console.log(chalk.blue.bold("\n🚀 Starting processing workflow...\n"))

    if(presetPath === null || presetPath === ''){
      const __rootProject = appRootPath.toString()
      presetPath = resolve(__rootProject,'img','presets','default.pp3')
    }

    // Step 1: Classify images based on exposure
    await this.processImageExposure()

    // Step 2: Apply preset (optional)
    if (applyPreset && presetPath) {
      console.log(chalk.blue("\n🎨 Applying preset to images...\n"))
      await this.applyPreset(presetPath, outputDir)
    }
    // Step 3: check detail in image
    const imageDetailChecker = new ImageDetailChecker()
    await imageDetailChecker.processDirectory(resolve(appRootPath.toString(), 'img', 'output' , 'processed'))



    // Step 4: zip file export

    this.zipProcessedFiles()

    // Step 5: Log statistics
    this.logStats()

    // Step 5: Clear temp file
    TempFileCleaner.clearTemp()
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
            await this.moveFile(fullPath, __tempGood, "goodExposureCount")
            continue
          case -1:
            await this.moveFile(fullPath, __tempUnder, "underExposureCount")
            continue
          case 1:
            await this.moveFile(fullPath, __tempOver, "overExposureCount")
            continue
        }
      }
      spinner.succeed()
    } catch (Error) {
      spinner.fail()
    }
  }


  
  /**
   * The function `getTotalFilesToProcess` asynchronously counts the total number of files in a
   * specified directory and its subdirectories.
   * @returns The function `getTotalFilesToProcess` is returning the total count of files found in the
   * directory specified by `__inputRoot`.
   */
  async getTotalFilesToProcess(){
    const __rootProject = appRootPath.toString()
    const __inputRoot = resolve(__rootProject, "img", "temp")
    let totalFiles = 0

    async function processDirectory(directory) {
      const files = await fs.readdir(directory);
  
      for (const file of files) {
        const fullPath = resolve(directory, file);
        const stats = await fs.stat(fullPath);
  
        if (stats.isDirectory()) {
          // Recursively process subdirectory
          await processDirectory(fullPath);
        } else {
          // Count the file
          totalFiles++;
        }
      }
    }
  
    try {
      await processDirectory(__inputRoot);
      return totalFiles; // Return the total count of files
    } catch (err) {
      console.error('Error processing directory:', err);
      throw err; // Re-throw the error to be handled by the caller
    }
    



    }


 /**
  * The function `applyPreset` processes images in subfolders based on exposure levels using a
  * specified preset path and outputs the processed images to a specified directory.
  * @param presetPath - The `presetPath` parameter in the `applyPreset` function refers to the path of
  * the preset file that will be applied to the images during processing. This preset file contains the
  * settings and adjustments that will be applied to the images using the `rawtherapee-cli` command
  * line tool.
  * @param outputDir - The `outputDir` parameter in the `applyPreset` function represents the directory
  * where the processed images will be saved after applying the preset. If a value is provided for
  * `outputDir`, the processed images will be saved in that directory. If no value is provided, the
  * processed images will be
  */
  async applyPreset(presetPath, outputDir) {
    const spinner = ora("Applying preset to images...").start()
    const __rootProject = appRootPath.toString()
    const __inputRoot = resolve(__rootProject, "img", "temp")
    const __output = resolve(outputDir || this.inputDir, "processed")

    try {
      // Ensure output directory exists
      await fs.mkdir(__output, { recursive: true })

      // Subfolders within the "temp" directory
      const exposureFolders = ["goodExposure", "overExposure", "underExposure"]
      const totalFiles = await this.getTotalFilesToProcess()

        let fileIndex = 1

      // Iterate through the subfolders
      for (const folder of exposureFolders) {
        const folderPath = resolve(__inputRoot, folder)
        const files = await fs.readdir(folderPath)

        

        for (let file of files) {
          const fullPath = resolve(folderPath, file)
          const outputPath = resolve(__output, folder, file)

          // Ensure the folder structure is preserved in the output directory
          await fs.mkdir(resolve(__output, folder), { recursive: true })

          // Example command for applying a preset using rawtherapee-cli
          const command = `rawtherapee-cli -q -Y -p "${presetPath}" -o "${outputPath}" -c "${fullPath}"`
          const { stdout, stderr } = await execa(command)
          if (stderr) {
            console.log(chalk.yellow(`${fileIndex}` + "/" + `${totalFiles}`))
            console.log(chalk.red(`Error processing file ${file}: ${stderr}`))
            fileIndex++
          } else {
            console.log(chalk.yellow(`${fileIndex}` + "/" + `${totalFiles}`))
            console.log(chalk.green(`✅ Preset applied to ${file}: ${stdout}`))
            fileIndex++
          }
        }
      }

      spinner.succeed("Preset applied successfully!")
    } catch (error) {
      spinner.fail("Failed to apply preset.")
    }
  }

  async zipProcessedFiles(){
    const __rootProject = appRootPath.toString()
    const spinner = ora("Exporting files ...").start()

    const zip = new AdmZip()
    const __processedDirectory = resolve(__rootProject,'img','output','processed')

    const outputZipPath = resolve(__rootProject,'archives',`${nanoid(10)}.zip`)
    zip.addLocalFolder(__processedDirectory)

    try{
      

      await zip.writeZipPromise(outputZipPath)
      spinner.succeed()

    }
    catch(error){
      spinner.fail()
      chalk.red(error)
    }
    

  }



  

}
