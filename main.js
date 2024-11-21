import { RawProcessor } from "./utils/RawProcessor.js";
import { RawPreprocessor } from "./utils/RawPreprocessor.js";
import { ExposureClassifier } from "./utils/ExposureClassifier.js";
import appRootPath from "app-root-path";
import { resolve } from "path";
import { log } from "console";

const preProcessor = new RawPreprocessor()
const rawProcessor = new RawProcessor("./img/dngOut")

const __rootProject = appRootPath.toString()

async function main() {
    await preProcessor.convertToDng()
    // You can change preset with change this line
    await rawProcessor.process({ applyPreset: true, presetPath: `${resolve(__rootProject,'img','presets','Portra-Curves.pp3')}` , outputDir: `${resolve(__rootProject, 'img', 'output')}` })

}


main()









// const process = new  RawProcessor(imagePath);