import { RawProcessor } from "./utils/RawProcessor.js";
import { RawPreprocessor } from "./utils/RawPreprocessor.js";
import { ExposureClassifier } from "./utils/ExposureClassifier.js";


const preProcessor = new RawPreprocessor()
const rawProcessor = new RawProcessor("./img/dngOut")


async function main(){
    await preProcessor.convertToDng()

    await rawProcessor.process()
}


main()









// const process = new  RawProcessor(imagePath);