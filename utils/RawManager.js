import { exiftool } from 'exiftool-vendored';
import { RawProcessor } from './RawProcessor.js';
export class RawManager {
    constructor(imagePath) {
      this.imagePath = imagePath
      this.processor = this.getProcessor()
    }


    async getMetadata(){
        try {
            const metadata = await exiftool.read(this.imagePath); // Read metadata from the image file
            console.log(metadata.Make);
            
            return metadata;
        } catch (error) {
            throw new Error('Error fetching metadata: ' + error.message);
        }

    }
  
    // Decide which flow to use based on the brand
    async getProcessor() {
     
        const metadata = await this.getMetadata()
        
        switch(metadata.Make) {
            case "RICOH IMAGING COMPANY, LTD.":
                return new RawProcessor()

            
        }

        
    }


}