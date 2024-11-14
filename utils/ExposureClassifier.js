import sharp from 'sharp'; // Ensure sharp is installed using 'npm install sharp'

/* The ExposureClassifier class is being exported in JavaScript. */
export class ExposureClassifier {
  constructor(rawImagePath) {
    this.rawImagePath = rawImagePath; // Path to the raw image file
  }

  // Function to analyze the exposure of the image
  /* The `async analyzeImageExposure()` function in the `ExposureClassifier` class is responsible for
  analyzing the exposure of an image. Here's a breakdown of what the function does: */
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

      // Analyze exposure
      const totalPixels = data.length;
      const mean = histogram.reduce((sum, count, index) => sum + (index * count), 0) / totalPixels;

      // Output histogram (optional)
      // console.log('Histogram Data:', histogram);
      console.log('Mean Pixel Value:', mean);

      // Determine exposure based on mean pixel value
      if (mean < 100) {
        console.log('Underexposure');
        return -1; // Underexposed
      } else if (mean > 150) {
        console.log('Overexposure');
        return 1; // Overexposed
      } else {
        console.log('Exposure looks OK');
        return 0; // Proper exposure
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
}