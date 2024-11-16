import { RawProcessor } from "./utils/RawProcessor.js";
import { RawPreprocessor } from "./utils/RawPreprocessor.js";

import { ExposureClassifier } from "./utils/ExposureClassifier.js";
const imagePath = './img/input/test-ov1.jpg'; // Replace with the actual image path

const classifier = new ExposureClassifier(imagePath)

console.log(classifier.analyzeImageExposure());


console.log(classifier);


// const processor = new RawPreprocessor()
// processor.convertToDng()
// const process = new  RawProcessor(imagePath);