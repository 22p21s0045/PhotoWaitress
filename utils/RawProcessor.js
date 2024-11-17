import { ExposureClassifier } from "./ExposureClassifier.js";
import { exec } from "child_process";

import { promises as fs } from 'fs';


import path, { resolve } from "path";
import os from "os";

import appRootPath from "app-root-path";
import { log } from "console";
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
                            const { stdout } = exec(`copy ${fullPath} ${__tempGood}`);
                            console.log(`Command Output: ${stdout}`);
                        } catch (error) {
                            console.error(`Error: ${error.message}`);
                        }

                    case -1:
                        try {
                            const { stdout } = exec(`copy ${fullPath} ${__tempUnder}`);
                            console.log(`Command Output: ${stdout}`);
                        } catch (error) {
                            console.error(`Error: ${error.message}`);
                        }

                        case 1:
                            try {
                                const { stdout } = exec(`copy ${fullPath} ${__tempHigh}`);
                                console.log(`Command Output: ${stdout}`);
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
