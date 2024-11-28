import fs from 'fs';
import path, { resolve } from 'path';
import { ImageDetailChecker } from '../../utils/ImageDetailChecker'; // Adjust the import path
import * as faceapi from 'face-api.js'; // Mock face-api.js functions
import appRootPath from 'app-root-path';



describe('ImageDetailChecker - getResult method (Use Close Eye image)', () => {
  let checker;
  const testFolder = resolve(appRootPath.toString(),'tests','img','imageDetailTest','eyeClose')// Path to folder with test images

  // Test: Should return true for images with closed eyes
  test('should return true for images with closed eyes in the closeEye folder', async () => {
    const imageFiles = fs.readdirSync(testFolder).filter(file => file.match(/\.(jpg|jpeg|png)$/i));

    
 

    // Loop through all image files and check the result
    for (const file of imageFiles) {
      const imagePath = path.join(testFolder, file);
      checker = new ImageDetailChecker(imagePath)

      // Get the result for this image
      const result = await checker.getResult();

      // Check that the result is true (eyes should be closed)
      expect(result.isPeopleClosingEyes).toBe(true);
    }
  },120000);
});
