import { RawProcessor } from "./utils/RawProcessor.js";
import { RawPreprocessor } from "./utils/RawPreprocessor.js";
const imagePath = './img/input/R0003914.DNG'; // Replace with the actual image path

const processor = new RawPreprocessor()
processor.convertToDng()
// const process = new  RawProcessor(imagePath);