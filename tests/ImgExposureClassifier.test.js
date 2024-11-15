import { ExposureClassifier } from '../utils/ExposureClassifier';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

jest.mock('sharp'); // Mock sharp for image processing

const imageDirectories = {
  goodExposure: './img/goodExposure',
  overExposure: './img/overExposure',
  underExposure: './img/underExposure',
};

describe('ExposureClassifier', () => {
  // Mock sharp to return a dummy buffer with pixel data
  beforeEach(() => {
    sharp.mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: new Buffer([100, 120, 130, 110, 105]), // Example pixel values
        info: { width: 800, height: 600 },
      }),
    }));
  });

  // Helper function to read files from the folder
  const getImageFiles = (folderPath) => {
    return fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.DNG'));
  };

  // Loop through images in the 'GoodExposure' folder
  describe('Good Exposure Images', () => {
    const goodExposureImages = getImageFiles(imageDirectories.goodExposure);

    it.each(goodExposureImages)('should classify %s as good exposure', async (imageFile) => {
      const imagePath = path.join(imageDirectories.goodExposure, imageFile);
      const classifier = new ExposureClassifier(imagePath);
      const exposure = await classifier.analyzeImageExposure();
      expect(exposure).toBe(0); // Expect '0' for good exposure
    });
  });

  // Loop through images in the 'OverExposure' folder
  describe('Over Exposure Images', () => {
    const overExposureImages = getImageFiles(imageDirectories.overExposure);

    it.each(overExposureImages)('should classify %s as overexposure', async (imageFile) => {
      const imagePath = path.join(imageDirectories.overExposure, imageFile);
      sharp.mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        grayscale: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Buffer([200, 210, 220, 250, 255]), // Simulate high pixel values (overexposure)
          info: { width: 800, height: 600 },
        }),
      }));

      const classifier = new ExposureClassifier(imagePath);
      const exposure = await classifier.analyzeImageExposure();
      expect(exposure).toBe(1); // Expect '1' for overexposure
    });
  });

  // Loop through images in the 'UnderExposure' folder
  describe('Under Exposure Images', () => {
    const underExposureImages = getImageFiles(imageDirectories.underExposure);

    it.each(underExposureImages)('should classify %s as underexposure', async (imageFile) => {
      const imagePath = path.join(imageDirectories.underExposure, imageFile);
      sharp.mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        grayscale: jest.fn().mockReturnThis(),
        raw: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: new Buffer([30, 40, 50, 60, 70]), // Simulate low pixel values (underexposure)
          info: { width: 800, height: 600 },
        }),
      }));

      const classifier = new ExposureClassifier(imagePath);
      const exposure = await classifier.analyzeImageExposure();
      expect(exposure).toBe(-1); // Expect '-1' for underexposure
    });
  });

  // Error handling test case
  it('should handle errors during image processing', async () => {
    sharp.mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockRejectedValue(new Error('Test error')),
    }));

    const classifier = new ExposureClassifier('path/to/image');
    console.error = jest.fn(); // Mock console.error to track calls

    await classifier.analyzeImageExposure(); // This should trigger the error

    // Verify that the error was logged
    expect(console.error).toHaveBeenCalledWith('Error processing image:', expect.any(Error));
  });
});
