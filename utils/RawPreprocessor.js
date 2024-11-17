import { spawn } from "child_process"
import { resolve } from "path"
import fs from 'fs'
import appRootPath from "app-root-path"
import ora from "ora"
export class RawPreprocessor {
  constructor(directoryPath) {
    this.directoryPath = directoryPath
  }

  async convertToDng() {
    const spinner = ora('Converting all images to DNG format for preprocessing ...').start();
    const __rootProject = appRootPath.toString()

    const dngOutDirectory = resolve(__rootProject, "img", "dngOut")
    const inputDirectory = resolve(__rootProject, "img", "input")

    const dngConverter = resolve(__rootProject, "libs", "dngconverter.exe")

    // Set option full resulution and multiple file process and set output directory

    const args = ["-p2", "-fl", "-mp" , "-d" , dngOutDirectory ]

    // Read all files in the input directory
    try {
      const files = fs.readdirSync(inputDirectory)

      // Add each file to args
      files.forEach((file) => {
        const fullPath = resolve(inputDirectory, file)
        const stat = fs.statSync(fullPath)

        if (stat.isFile()) {
          args.push(fullPath)
        }
      })

      console.log("Arguments:", args)
      // Here you can pass the `args` array to spawn or exec the DNG converter
      // Example:
      // spawn('path/to/dng-converter', args, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Error processing files in ${inputDirectory}:`, err.message)
    }


    const dngProcess = spawn(dngConverter, args, { stdio: 'inherit' });

    // Handle process events
    dngProcess.on('error', (err) => {
      console.error(`Failed to start process: ${err.message}`);
    });

    dngProcess.on('close', (code) => {
      if (code === 0) {
        spinner.succeed()
        console.log("DNG conversion completed successfully!");
      } else {
        spinner.fail()
        console.error(`DNG conversion failed with exit code: ${code}`);
      }
    });
  } catch (err) {
    console.error(`Error processing files in ${inputDirectory}:`, err.message);

  }
}
