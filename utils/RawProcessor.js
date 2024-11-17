import { ExposureClassifier } from "./ExposureClassifier.js";
import { exec } from "child_process";
import { promises as fs } from 'fs';
import shell from 'shelljs'
import path, { resolve } from "path";

import appRootPath from "app-root-path";
export class RawProcessor {
    constructor(inputDir) {
        this.inputDir = inputDir;
        this.appRootPath = appRootPath.toString()
    }

    async process(){
        const __rootProject = appRootPath.toString()

        const __input = resolve(__rootProject,'img','dngOut')

        const __tempGood = resolve(__rootProject,'img','temp','goodExposure')
        const __tempUnder = resolve(__rootProject,'img','temp','underExposure')
        const __tempOver = resolve(__rootProject,'img','temp','OverExposure')

        try {
            const dir = await fs.readdir(__input)

            for(let file of dir){

                const fullPath = resolve(__input,file)
                
                const exposureClassifier = new ExposureClassifier(fullPath)

                switch(await exposureClassifier.analyzeImageExposure()) {

                    case 0:
                        try {
                            // Use ShellJS's mv() method for moving files
                            const result = shell.mv(fullPath, __tempGood);
                        
                            if (result.code !== 0) {
                                // If the mv command fails, log an error
                                console.error(`Error: Failed to move file. ${result.stderr}`);
                            } else {
                                // If successful, log the success message
                                console.log('File moved successfully');
                            }
                        
                            // Continue with the next iteration if required
                            continue
                        }
                        catch (error) {
                            // Catch any errors that occur
                            console.error(`Error: ${error.message}`);
                        }

                    case -1:
                        try {
                            // Use ShellJS's mv() method for moving files
                            const result = shell.mv(fullPath, __tempUnder);
                        
                            if (result.code !== 0) {
                                // If the mv command fails, log the error
                                console.error(`Error: Failed to move file. ${result.stderr}`);
                            } else {
                                // If successful, log the success message
                                console.log('File moved successfully');
                            }
                        
                            // Continue with the next iteration
                            continue;
                        } catch (error) {
                            // Catch any unexpected errors
                            console.error(`Error: ${error.message}`);
                        }
                        case 1:
                            try {
                                const { stdout } = exec(`move ${fullPath} ${__tempOver}`);
                                console.log(`Command Output: ${stdout}`);
                                continue
                            } catch (error) {
                                console.error(`Error: ${error.message}`);
                            }



                }
                
                


            }

        }

        catch(Error){
            
        }


    }

}
