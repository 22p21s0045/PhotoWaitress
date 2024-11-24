import sharp from 'sharp'; // Ensure sharp is installed using 'npm install sharp'

export class ExposureClassifier {
  constructor(rawImagePath) {
    this.rawImagePath = rawImagePath; // Path to the raw image file
  }

  // Function to analyze the exposure of the image
  async analyzeImageExposure() {
    try {
      // Read the image and convert it to grayscale
      const { data, info } = await sharp(this.rawImagePath)
        .resize({ width: 800 }) // Resize to reduce processing time (optional)
        .grayscale() // Convert to grayscale
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Compute histogram manually
      const histogram = Array(256).fill(0);
      for (let i = 0; i < data.length; i++) {
        const pixelValue = data[i];
        histogram[pixelValue]++;
      }

      // Analyze exposure using histogram data
      const totalPixels = data.length;

      // Thresholds for "dark" and "light" regions
      const darkThreshold = 50; // Pixels with value <= 50 are considered "dark"
      const lightThreshold = 200; // Pixels with value >= 200 are considered "light"

      // Calculate light and dark pixel counts
      const darkPixels = histogram.slice(0, darkThreshold + 1).reduce((sum, count) => sum + count, 0);
      const lightPixels = histogram.slice(lightThreshold).reduce((sum, count) => sum + count, 0);

      // Calculate the ratios
      const darkRatio = darkPixels / totalPixels;
      const lightRatio = lightPixels / totalPixels;

      console.log('Dark Pixel Ratio:', darkRatio.toFixed(2));
      console.log('Light Pixel Ratio:', lightRatio.toFixed(2));

      // Determine exposure based on ratios
      if (darkRatio > 0.4) {
        console.log('Underexposure detected due to high dark ratio.');
        return -1; // Underexposed
      } else if (lightRatio > 0.6) {
        console.log('Overexposure detected due to high light ratio.');
        return 1; // Overexposed
      } else {
        console.log('Exposure looks balanced.');
        return 0; // Proper exposure
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
}
