// import { RawProcessor } from "./utils/RawProcessor.js";
// const imagePath = './img/input/R0003914.DNG'; // Replace with the actual image path
// const process = new  RawProcessor(imagePath);

// console.log(process.exposureCorrection());


import { RawManager } from "./utils/RawManager.js";
const imagePath = './img/input/R0003914.DNG'; 
const process = new RawManager(imagePath);

console.log(process.getMetadata());



