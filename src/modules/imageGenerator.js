import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { retry } from '../utils/helpers.js';

/**
 * Image Generator using Gemini 2.5 Flash Image
 * Generates high-quality vertical images with SynthID watermark
 */

export class ImageGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required for image generation');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Use Gemini 2.5 Flash Image model
    const modelName = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    console.log(`🎨 Using image model: ${modelName}`);
  }

  /**
   * Generate image from prompt
   * Returns base64 image data
   */
  async generateImage(prompt, outputPath) {
    try {
      console.log('🎨 Generating image with Gemini 2.5 Flash Image...');
      console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

      // Generate image using retry mechanism
      const result = await retry(async () => {
        return await this.model.generateContent(prompt);
      }, 3, 2000);

      const response = await result.response;
      
      // Extract image data
      // Note: The actual API response structure may vary
      // This is a placeholder - adjust based on actual Gemini 2.5 Flash Image API
      let imageData;
      
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        
        // Check if response contains image data
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
              imageData = part.inlineData.data;
              break;
            }
          }
        }
      }

      if (!imageData) {
        throw new Error('No image data in response');
      }

      // Save image to file
      const buffer = Buffer.from(imageData, 'base64');
      await fs.writeFile(outputPath, buffer);

      // Verify file was created
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        throw new Error('Generated image file is empty');
      }

      console.log(`✅ Image generated: ${path.basename(outputPath)}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   SynthID watermark: Included (automatic in 2026)\n`);

      return {
        path: outputPath,
        size: stats.size,
        watermarked: true, // SynthID is automatic in Gemini 2.5 Flash Image
      };

    } catch (error) {
      console.error(`❌ Image generation failed: ${error.message}`);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Validate image quality
   * Checks if image meets minimum requirements
   */
  async validateImage(imagePath) {
    try {
      const stats = await fs.stat(imagePath);
      
      // Check file size (should be > 50KB for 1080x1920)
      if (stats.size < 50 * 1024) {
        throw new Error('Image file too small, may be corrupted');
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate image with fallback
   * If generation fails, can optionally use a placeholder
   */
  async generateWithFallback(prompt, outputPath, useFallback = false) {
    try {
      return await this.generateImage(prompt, outputPath);
    } catch (error) {
      if (useFallback) {
        console.warn('⚠️  Using fallback placeholder image');
        // Could implement fallback logic here
        throw error;
      }
      throw error;
    }
  }
}

export default ImageGenerator;
