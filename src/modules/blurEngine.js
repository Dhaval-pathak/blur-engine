import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { calculateBlurSteps } from '../utils/helpers.js';

/**
 * Blur Engine
 * Handles progressive de-pixelation of images
 * Generates multiple blur stages for smooth animation
 */

export class BlurEngine {
  constructor() {
    this.blurCache = new Map();
  }

  /**
   * Generate blur stages for an image
   * Creates multiple versions from pixelated to clear
   */
  async generateBlurStages(imagePath, outputDir, config) {
    const { blur, output } = config;
    const { startResolution, progression } = blur;
    const { width: endWidth, height: endHeight, fps } = output;
    const duration = config.duration;

    console.log('🔲 Generating blur stages...');
    console.log(`   Start: ${startResolution}x${startResolution} pixels`);
    console.log(`   End: ${endWidth}x${endHeight}`);
    console.log(`   Progression: ${progression}`);
    console.log(`   Duration: ${duration}s @ ${fps}fps`);

    const totalFrames = duration * fps;
    const steps = calculateBlurSteps(startResolution, endWidth, endHeight, totalFrames, progression);

    console.log(`   Total stages: ${steps.length}`);

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Load original image
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`   Original size: ${metadata.width}x${metadata.height}`);

    const blurStages = [];

    // Generate blur stages (sample every 10 frames to save processing)
    const sampleRate = 10;
    for (let i = 0; i < steps.length; i += sampleRate) {
      const step = steps[i];
      const stagePath = path.join(outputDir, `blur_stage_${String(step.frame).padStart(4, '0')}.jpg`);

      try {
        // Resize down to pixelated size, then back up to target size
        // This creates the pixelation effect
        await sharp(imagePath)
          .resize(step.width, step.height, { fit: 'fill' })
          .resize(endWidth, endHeight, { kernel: 'nearest' }) // Use nearest neighbor for blocky pixels
          .jpeg({ quality: 90 })
          .toFile(stagePath);

        blurStages.push({
          frame: step.frame,
          path: stagePath,
          resolution: `${step.width}x${step.height}`,
        });

      } catch (error) {
        console.error(`   ❌ Failed to generate stage ${step.frame}: ${error.message}`);
      }
    }

    // Also save the final clear image
    const finalPath = path.join(outputDir, 'blur_stage_final.jpg');
    await sharp(imagePath)
      .resize(endWidth, endHeight, { fit: 'cover' })
      .jpeg({ quality: 95 })
      .toFile(finalPath);

    blurStages.push({
      frame: totalFrames,
      path: finalPath,
      resolution: `${endWidth}x${endHeight}`,
    });

    console.log(`✅ Generated ${blurStages.length} blur stages\n`);

    return {
      stages: blurStages,
      totalFrames,
      steps, // Return all steps for interpolation in Remotion
    };
  }

  /**
   * Get blur level for a specific frame
   * Used by Remotion to interpolate blur in real-time
   */
  getBlurLevelForFrame(frame, totalFrames, startResolution, endWidth, endHeight, progression) {
    let progress;
    
    if (progression === 'exponential') {
      progress = Math.pow(frame / totalFrames, 2);
    } else {
      progress = frame / totalFrames;
    }

    const width = Math.round(startResolution + (endWidth - startResolution) * progress);
    const height = Math.round(startResolution + (endHeight - startResolution) * progress);

    return { width, height, progress };
  }

  /**
   * Generate single blurred image
   */
  async generateBlurredImage(imagePath, outputPath, pixelSize) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Calculate target dimensions based on pixel size
      const targetWidth = Math.max(10, Math.round(metadata.width / pixelSize));
      const targetHeight = Math.max(10, Math.round(metadata.height / pixelSize));

      await sharp(imagePath)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .resize(metadata.width, metadata.height, { kernel: 'nearest' })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to generate blurred image: ${error.message}`);
    }
  }

  /**
   * Calculate optimal blur progression
   */
  calculateOptimalProgression(duration, fps) {
    // For dramatic effect, use exponential progression
    // This makes the reveal more exciting at the end
    const totalFrames = duration * fps;
    
    return {
      totalFrames,
      progression: 'exponential',
      revealSpeed: totalFrames > 120 ? 'slow' : 'fast',
    };
  }

  /**
   * Clean up blur stage files
   */
  async cleanupBlurStages(outputDir) {
    try {
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        if (file.startsWith('blur_stage_')) {
          await fs.unlink(path.join(outputDir, file));
        }
      }
      console.log('🧹 Blur stages cleaned up');
    } catch (error) {
      console.warn('Could not clean blur stages:', error.message);
    }
  }
}

export default BlurEngine;
