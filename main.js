import { ExposureClassifier } from "./utils/ExposureChecker.js";

const imagePath = './img/input/R0003914.DNG'; // Replace with the actual image path
const classifier = new ExposureClassifier(imagePath);

console.log(classifier.analyzeImageExposure());
