
import { RawProcessor } from "./utils/RawProcessor.js";
const imagePath = './img/input/R0003914.DNG'; // Replace with the actual image path
const process = new  RawProcessor(imagePath);

console.log(process.exposureCorrection());
