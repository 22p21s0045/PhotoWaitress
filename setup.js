import { RawPreprocessor } from "./utils/RawPreprocessor.js"

function setup(){
    const rawPreProcessor = new RawPreprocessor()
    rawPreProcessor.setupProjectStructure()
}


setup()