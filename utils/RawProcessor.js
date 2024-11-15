import { ExposureClassifier } from "./ExposureClassifier.js";
import { exec , spawn } from "child_process";
import {dirname , resolve} from "path"
export class RawProcessor {
    

    constructor(imagePath){
        this.imagePath = imagePath;
        this.ExposureClassifier = new ExposureClassifier(imagePath);
    }


  

    async exposureCorrection() {
        try {
            const exposureStatus = await this.ExposureClassifier.analyzeImageExposure();

            let command;
            if (exposureStatus === -1) {
                // Underexposed: Increase exposure
                command = `rawtherapee-cli -o corrected_image.tif -c ${this.imagePath} -E +1.0`;
                console.log("Applying exposure correction for underexposure.");
            } else if (exposureStatus === 1) {
                // Overexposed: Decrease exposure
                command = `rawtherapee-cli -o corrected_image.tif -c ${this.imagePath} -E -1.0`;
                console.log("Applying exposure correction for overexposure.");
            } else {
                console.log("Exposure is within acceptable range; no correction needed.");
                return;
            }

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing exposure correction: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Standard error: ${stderr}`);
                    return;
                }
                console.log(`Exposure correction applied successfully: ${stdout}`);
            });
        } catch (error) {
            console.error("Error in exposure correction:", error);
        }
    }



}