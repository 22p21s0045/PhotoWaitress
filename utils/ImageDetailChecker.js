import fs from "fs";
import appRootPath from "app-root-path";
import * as faceapi from "face-api.js";
import { Canvas, Image, loadImage } from "canvas"; // Import Canvas and loadImage from canvas module
import path, { resolve } from "path";

// Monkey patch to make face-api.js work with canvas in Node.js
faceapi.env.monkeyPatch({ Canvas, Image });

export class ImageDetailChecker {
  constructor(imagePath) {
    this.imagePath = imagePath;
    this.modelPath = resolve(appRootPath.toString(),'models')
    this.outputFolderPath = resolve(appRootPath.toString(),'tests','img' , 'imageDetailTest','debug')
  }

  async getResult(){

    const isPeopleClosingEyes = await this.checkClosedEyes();

    return {
      isPeopleClosingEyes,
    };

    
  }


  async processDirectory(directoryPath) {
    // Load models once for efficiency
    await this.loadModels();

    const results = [];

    const traverseDirectory = async (currentPath) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively process subdirectories
          await traverseDirectory(entryPath);
        } else if (entry.isFile() && entry.name.match(/\.(jpg|jpeg|png)$/i)) {
          console.log(`Processing image: ${entryPath}`);

          try {
            // Set the imagePath dynamically and check for closed eyes
            this.imagePath = entryPath;

            const isPeopleClosingEyes = await this.checkClosedEyes();

            results.push({
              filePath: entryPath,
              isPeopleClosingEyes,
            });
          } catch (error) {
            console.error(`Error processing ${entryPath}:`, error);
          }
        } else {
          console.log(`Skipping non-image file: ${entryPath}`);
        }
      }
    };

    // Start traversing from the root directory
    await traverseDirectory(directoryPath);

    return results;
  }

  // Load models
  async loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelPath);
    await faceapi.nets.tinyFaceDetector.loadFromDisk(this.modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
    console.log("Models loaded successfully.");
  }

  // Detect eyes and check for closed eyes
  async checkClosedEyes() {
    // Ensure models are loaded
    await this.loadModels();

    // Load the image
    const image = await loadImage(this.imagePath);
    const canvas = new Canvas(image.width, image.height);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    // Perform face detection and landmark analysis
    const detections = await faceapi
      .detectAllFaces(canvas)
      .withFaceLandmarks();

    let hasClosedEyes = false;

    detections.forEach((detection) => {
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      const earLeft = this.calculateEAR(leftEye);
      const earRight = this.calculateEAR(rightEye);

      // Determine if eyes are closed
      const isLeftEyeClosed = earLeft < 0.3;
      const isRightEyeClosed = earRight < 0.3;

      if (isLeftEyeClosed && isRightEyeClosed) {
        hasClosedEyes = true;
      }

      // Draw bounding box and label
      const box = detection.detection.box;
      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.strokeRect(box.x, box.y, box.width, box.height);

      context.fillStyle = "red";
      context.font = "16px Arial";
      const text = isLeftEyeClosed && isRightEyeClosed ? "Eyes Closed" : "Eyes Open";
      context.fillText(text, box.x, box.y - 10);

      // Optional: Draw landmarks
      this.drawLandmarks(context, landmarks);
    });

    // Save the output image
    if (!fs.existsSync(this.outputFolderPath)) {
      fs.mkdirSync(this.outputFolderPath, { recursive: true });
    }
    const outputPath = path.join(this.outputFolderPath, path.basename(this.imagePath));
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    out.on("finish", () => console.log(`Saved output to ${outputPath}`));

    return hasClosedEyes;
  }

  // Calculate Eye Aspect Ratio (EAR)
  calculateEAR(eye) {
    const p1 = eye[0];
    const p2 = eye[1];
    const p3 = eye[2];
    const p4 = eye[3];
    const p5 = eye[4];
    const p6 = eye[5];

    const vertical1 = Math.sqrt((p2.y - p6.y) ** 2 + (p2.x - p6.x) ** 2);
    const vertical2 = Math.sqrt((p3.y - p5.y) ** 2 + (p3.x - p5.x) ** 2);
    const horizontal = Math.sqrt((p1.y - p4.y) ** 2 + (p1.x - p4.x) ** 2);

    return (vertical1 + vertical2) / (2 * horizontal);
  }

  // Draw landmarks (for debugging)
  drawLandmarks(context, landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    context.strokeStyle = "blue";
    leftEye.forEach((point) => context.strokeRect(point.x - 1, point.y - 1, 2, 2));

    context.strokeStyle = "green";
    rightEye.forEach((point) => context.strokeRect(point.x - 1, point.y - 1, 2, 2));
  }
}