import { RawProcessor } from "./utils/RawProcessor.js";
import { RawPreprocessor } from "./utils/RawPreprocessor.js";

import { ExposureClassifier } from "./utils/ExposureClassifier.js";


const preProcessor = new RawPreprocessor()
const rawProcessor = new RawProcessor("./img/dngOut")

// preProcessor.convertToDng()

rawProcessor.process()







// const process = new  RawProcessor(imagePath);