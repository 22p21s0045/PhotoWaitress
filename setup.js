import { RawPreprocessor } from "./utils/RawPreprocessor.js"
import { CLICommandChecker } from "./utils/setup/CLICommandChecker.js"
import { ExeDowloadManager } from "./utils/setup/ExeDowloadManager.js"

async function setup(){
    const manager = new ExeDowloadManager()
    const rawPreProcessor = new RawPreprocessor()
    const commandChecker = new CLICommandChecker(['rawtherapee-cli'])
    
    try {
       await rawPreProcessor.setupProjectStructure()
       await manager.setupDngConverter()
    } catch (error) {
        console.error("Setup failed:", error)
    }

    try{
        await commandChecker.checkAllCommands()

    }
    catch(error){
        console.error(error);
        

    }
}


setup()