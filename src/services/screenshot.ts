import fs from 'fs';
import path from 'path';
import screenshot from 'screenshot-desktop';

// Try to import Sharp, but don't fail if it's not available
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp is not available, using fallback image handling');
}

/**
 * Captures a screenshot and returns it as a base64 string
 */
export async function captureScreenshot(): Promise<string> {
  try {
    // Capture the raw screenshot buffer
    const buffer = await screenshot();

    // Use sharp to convert to PNG format if available
    if (sharp) {
      const pngBuffer = await sharp(buffer).png().toBuffer();

      return pngBuffer.toString('base64');
    } else {
      // Fallback: Just return the raw buffer as base64
      // This might not be ideal for all workflows but allows operation without Sharp
      return buffer.toString('base64');
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}

/**
 * Saves a base64 image to a file
 * @param base64Image - The base64 string of the image
 * @param filePath - The path where to save the file
 */
export async function saveScreenshotToFile(base64Image: string, filePath: string): Promise<void> {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');

    if (sharp) {
      // Use sharp to save as PNG if available
      await sharp(buffer).png().toFile(filePath);
    } else {
      // Fallback: Save the raw buffer directly
      fs.writeFileSync(filePath, buffer);
    }
  } catch (error) {
    console.error('Error saving screenshot:', error);
    throw error;
  }
}
