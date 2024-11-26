import path, { resolve } from 'path';
import fs from 'fs';
import { ImageDetailChecker } from '../utils/ImageDetailChecker';
import appRootPath from 'app-root-path';
// Folder paths for testing
const eyeCloseFolderPath = resolve(appRootPath.toString(),'tests','img','imageDetailTest','eyeClose')


// Helper function to get all image files recursively from subfolders
function getImageFilesFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  let imageFiles = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      imageFiles = imageFiles.concat(getImageFilesFromFolder(filePath));
    } else if (/\.(jpg|jpeg|png|dng)$/i.test(file)) {
      imageFiles.push(filePath);
    }
  });
  return imageFiles;
}

// Helper function to run the analysis and check the result
async function testGetDetail(imagePath) {
  const checker = new ImageDetailChecker(imagePath);
  const result = await checker.getImageDetail();
  return result;
}

describe('ImageDetailChecker - EyeClose Folder', () => {
  let eyeCloseImages;
  let otherImages;

  beforeAll(() => {
    // Fetch all images from the respective folders
    eyeCloseImages = getImageFilesFromFolder(eyeCloseFolderPath);
  });

  it('should return isCloseEye as true for all images in the eyeClose folder', async () => {
    expect(eyeCloseImages.length).toBeGreaterThan(0); // Ensure folder has images

    for (const imagePath of eyeCloseImages) {
      console.log(`Processing image in eyeClose folder: ${imagePath}`);

      const result = await testGetDetail(imagePath);

      console.log(`Result for ${imagePath}:`, result);

      // Validate that isCloseEye is true for these images
      expect(result).toHaveProperty('isCloseEye', true);
    }
  },120000);
});
