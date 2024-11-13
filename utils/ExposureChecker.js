class ExposureChecker {
    constructor(imagePath) {
      this.imagePath = imagePath;
    }
  
    async getHistogram() {
      // Load the image and convert it to grayscale to focus on brightness
      const image = await sharp(this.imagePath)
        .greyscale()  // Convert to grayscale (brightness only)
        .raw()  // Get raw pixel data
        .toBuffer();
  
      // Calculate the histogram of pixel values
      const histogram = this.calculateHistogram(image);
      return histogram;
    }
  
    calculateHistogram(imageBuffer) {
      const histogram = Array(256).fill(0); // 256 bins for pixel values (0-255)
  
      for (let i = 0; i < imageBuffer.length; i++) {
        const pixelValue = imageBuffer[i];
        histogram[pixelValue]++;
      }
  
      return histogram;
    }
  
    classifyExposure() {
      return this.getHistogram()
        .then((histogram) => {
          const totalPixels = histogram.reduce((acc, val) => acc + val, 0);
          const underexposedThreshold = 0.2 * totalPixels; // 20% of pixels in dark range
          const overexposedThreshold = 0.8 * totalPixels; // 80% of pixels in bright range
  
          let darkPixels = 0;
          let brightPixels = 0;
  
          // Check the dark (0-63) and bright (192-255) pixel ranges
          for (let i = 0; i < 64; i++) darkPixels += histogram[i];
          for (let i = 192; i < 256; i++) brightPixels += histogram[i];
  
          if (darkPixels > underexposedThreshold) {
            return 'Underexposed';
          } else if (brightPixels > overexposedThreshold) {
            return 'Overexposed';
          } else {
            return 'Well-exposed';
          }
        })
        .catch((err) => {
          console.error('Error analyzing image:', err);
          return 'Error';
        });
    }
  }