// ExposureClassifier.test.js
import { ExposureClassifier } from '../utils/ExposureClassifier';
import sharp from 'sharp';

jest.mock('sharp');

describe('ExposureClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new ExposureClassifier('path/to/test/image.jpg');
  });

  it('should return -1 for underexposed images', async () => {
    // Mock sharp's behavior for an underexposed image
    sharp.mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: Buffer.from(Array(800).fill(50)), // Simulate underexposed pixels
        info: { width: 800, height: 1 }
      })
    });

    const result = await classifier.analyzeImageExposure();
    expect(result).toBe(-1);
  });

  it('should return 1 for overexposed images', async () => {
    // Mock sharp's behavior for an overexposed image
    sharp.mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: Buffer.from(Array(800).fill(200)), // Simulate overexposed pixels
        info: { width: 800, height: 1 }
      })
    });

    const result = await classifier.analyzeImageExposure();
    expect(result).toBe(1);
  });

  it('should return 0 for properly exposed images', async () => {
    // Mock sharp's behavior for a properly exposed image
    sharp.mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: Buffer.from(Array(800).fill(120)), // Simulate average-exposure pixels
        info: { width: 800, height: 1 }
      })
    });

    const result = await classifier.analyzeImageExposure();
    expect(result).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    // Mock sharp to throw an error
    sharp.mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockRejectedValue(new Error('Test error'))
    });

    const result = await classifier.analyzeImageExposure();
    expect(result).toBeUndefined();
    // Optionally, you can also spy on console.error to check for the error message
    // jest.spyOn(console, 'error').mockImplementation(() => {});
  });
});






