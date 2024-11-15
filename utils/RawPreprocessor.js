import { spawn } from "child_process";
import { resolve } from "path";

import appRootPath from "app-root-path";
export class RawPreprocessor {

    constructor(directoryPath){
        this.directoryPath = directoryPath
    }


    convertToDng(){
        
        const __rootProject = appRootPath.toString()
        
        const executableWin = resolve(__rootProject, 'libs', 'dnglab.exe');

        

        const inputDirectory = resolve(__rootProject, 'img', 'input');

        const args = ['convert' , inputDirectory, `${resolve(__rootProject, 'img' , 'output' )}` , '-d' ]

        
        try {
            // Spawn the process with arguments
            const winProcess = spawn(executableWin, args);
          
            // Handle the process's stdout stream
            winProcess.stdout.on('data', (data) => {
              console.log(`stdout: ${data}`);
            });
          
            // Handle the process's stderr stream (errors from the process)
            winProcess.stderr.on('data', (data) => {
              console.error(`stderr: ${data}`);
            });
          
            // Handle the process's exit event
            winProcess.on('close', (code) => {
              if (code !== 0) {
                console.error(`Process exited with code ${code}`);
              } else {
                console.log('Process completed successfully');
              }
            });
          } catch (error) {
            // Catch errors if the spawn operation itself fails
            console.error(`Failed to spawn process: ${error.message}`);
          }

        try {
            
            switch (process.platform){
                case "win32" :
                    
            }


        }

        catch(error) {

        }


    }
}