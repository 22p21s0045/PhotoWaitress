import appRootPath from "app-root-path"
import {resolve} from 'path'
import path from "path"
import fs from 'fs'
export class TempFileCleaner {
    
        static tempFolder = resolve(appRootPath.toString() , 'img' , "temp" )  
    

        static clearTemp() {
            try {
              // Call the recursive delete function
              TempFileCleaner.deleteFilesInFolder(this.tempFolder);
              console.log("All files in the temp folder (and subfolders) have been cleared.");
            } catch (error) {
              console.error(`Error clearing temp folder: ${error.message}`);
            }
          }
        
          // Function to delete files in a folder, including subdirectories
          static deleteFilesInFolder(folderPath) {
            const files = fs.readdirSync(folderPath);
        
            files.forEach((file) => {
              const filePath = path.join(folderPath, file);
              const stats = fs.statSync(filePath);
        
              if (stats.isDirectory()) {
                // If it's a directory, recursively call the method to delete its contents
                TempFileCleaner.deleteFilesInFolder(filePath);
              } else if (stats.isFile()) {
                // If it's a file, delete it
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`);
              }
            });
          }
}