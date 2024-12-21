import { RawPreprocessor } from "./utils/RawPreprocessor.js"
import { ExeDowloadManager } from "./utils/setup/ExeDowloadManager.js"

async function setup(){
    const manager = new ExeDowloadManager()
    const rawPreProcessor = new RawPreprocessor()
    
    try {
       await rawPreProcessor.setupProjectStructure()
       await manager.setupDngConverter()
    } catch (error) {
        console.error("Setup failed:", error)
    }
}


setup()