import path from 'path';
import fs from 'fs';
import { ExposureClassifier } from '../utils/ExposureClassifier'; // Adjust the import if needed
import appRootPath from 'app-root-path';

// Helper function to run the analysis and check the result
async function testExposure(imagePath) {
  const classifier = new ExposureClassifier(imagePath);
  const exposureResult = await classifier.analyzeImageExposure();
  return exposureResult;
}

// Helper function to get all image files recursively from subfolders
function getImageFilesFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  let imageFiles = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    // If it's a directory, recurse into it
    if (stats.isDirectory()) {
      imageFiles = imageFiles.concat(getImageFilesFromFolder(filePath));
    } else if (/\.(jpg|jpeg|png|dng)$/i.test(file)) {
      // Only add image files with specified extensions
      imageFiles.push(filePath);
    }
  });
  return imageFiles;
}

describe('ExposureClassifier with real image', () => {
  const __rootProject = appRootPath.toString();
  const imageFolder = path.join(__rootProject, 'tests', 'img'); // Root folder where your subfolders are located
  const imageFiles = getImageFilesFromFolder(imageFolder);

  it('should find some image files', () => {
    expect(imageFiles.length).toBeGreaterThan(0); // Assert that we have images to test
  });

  test.each(imageFiles)('should classify exposure of image %s correctly', async (imagePath) => {
    const result = await testExposure(imagePath);

    // You can customize your expected values based on image filenames or their paths
    if (imagePath.includes('goodExposure')) {
      expect(result).toBe(0); // Proper exposure
    } else if (imagePath.includes('underExposure')) {
      expect(result).toBe(-1); // Underexposure
    } else if (imagePath.includes('overExposure')) {
      expect(result).toBe(1); // Overexposure
    }
  });
});
