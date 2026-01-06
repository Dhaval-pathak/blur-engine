import * as dotenv from 'dotenv';
import { VideoConfigSchema } from './schema.js';
import fs from 'fs/promises';

dotenv.config();

/**
 * Configuration Manager
 * Handles loading, validation, and merging of configs
 */

export class ConfigManager {
  constructor() {
    this.defaultConfig = {
      category: process.env.DEFAULT_CATEGORY || 'monuments',
      duration: parseInt(process.env.DEFAULT_DURATION || '5', 10),
      clues: parseInt(process.env.DEFAULT_CLUES || '3', 10),
      voice: {
        narrator: process.env.VOICE_NARRATOR || 'en-US-AriaNeural',
        reveal: process.env.VOICE_REVEAL || 'en-IN-PrabhatNeural',
      },
      blur: {
        startResolution: parseInt(process.env.BLUR_START_RESOLUTION || '10', 10),
        progression: process.env.BLUR_PROGRESSION || 'exponential',
      },
      output: {
        width: parseInt(process.env.VIDEO_WIDTH || '1080', 10),
        height: parseInt(process.env.VIDEO_HEIGHT || '1920', 10),
        fps: parseInt(process.env.VIDEO_FPS || '30', 10),
        codec: 'h264',
      },
    };
  }

  /**
   * Load and validate configuration
   */
  async loadConfig(configPath = null, overrides = {}) {
    let fileConfig = {};

    if (configPath) {
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        fileConfig = JSON.parse(configContent);
      } catch (error) {
        console.warn(`⚠️  Could not load config file: ${configPath}`);
      }
    }

    // Merge configs: defaults < file < overrides
    const mergedConfig = {
      ...this.defaultConfig,
      ...fileConfig,
      ...overrides,
    };

    console.log('🔧 Configuration loaded:');
    console.log(`   Category: ${mergedConfig.category}`);
    console.log(`   Subject: ${mergedConfig.subject || 'random'}`);
    console.log(`   Duration: ${mergedConfig.duration}s`);
    console.log(`   Clues: ${mergedConfig.clues}`);

    // Validate using Zod schema
    const validated = VideoConfigSchema.parse(mergedConfig);
    return validated;
  }

  /**
   * Save configuration to file
   */
  async saveConfig(config, outputPath) {
    const validated = VideoConfigSchema.parse(config);
    await fs.writeFile(
      outputPath,
      JSON.stringify(validated, null, 2),
      'utf-8'
    );
    return outputPath;
  }

  /**
   * Get environment variables
   */
  getEnv(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  /**
   * Validate required environment variables
   */
  validateEnv() {
    const required = ['GEMINI_API_KEY'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please create a .env file based on .env.example'
      );
    }
  }
}

export default new ConfigManager();
