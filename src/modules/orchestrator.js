import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import configManager from '../config/configManager.js';
import { PROMPTS, SUBJECT_LIBRARY } from '../config/prompts.js';
import ImageGenerator from './imageGenerator.js';
import ClueGenerator from './clueGenerator.js';
import BlurEngine from './blurEngine.js';
import TTSEngine from './ttsEngine.js';
import gpuDetector from '../utils/gpuDetector.js';
import { sanitizeFilename, generateTimestamp } from '../utils/helpers.js';

const execAsync = promisify(exec);

/**
 * Orchestrator
 * Coordinates the entire blur reveal video generation pipeline
 * Image → Clues → Audio → Blur → Video → Output
 */

export class Orchestrator {
  constructor() {
    this.imageGenerator = null;
    this.clueGenerator = null;
    this.blurEngine = null;
    this.ttsEngine = null;
    this.outputDir = process.env.OUTPUT_DIR || './output';
    this.gpuInfo = null;
  }

  /**
   * Initialize all modules
   */
  async init() {
    console.log('🚀 Initializing Blur Reveal Engine...\n');

    // Validate environment
    configManager.validateEnv();

    // Detect GPU capabilities
    this.gpuInfo = await gpuDetector.detect();
    gpuDetector.printSummary();

    // Initialize modules
    this.imageGenerator = new ImageGenerator();
    this.clueGenerator = new ClueGenerator();
    this.blurEngine = new BlurEngine();
    this.ttsEngine = new TTSEngine();

    // Setup directories
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'images'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'videos'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'metadata'), { recursive: true });

    console.log('✅ Orchestrator initialized\n');
  }

  /**
   * Main video generation pipeline
   */
  async generateVideo(userConfig = {}) {
    try {
      // Step 1: Load and merge configuration
      console.log('📋 Step 1: Loading configuration...');
      const config = await configManager.loadConfig(null, userConfig);
      
      // Select subject
      const subject = config.subject || this.selectRandomSubject(config.category);
      console.log(`   Subject: ${subject}`);
      console.log(`   Category: ${config.category}\n`);

      // Step 2: Generate image with Gemini 2.5 Flash Image
      console.log('🎨 Step 2: Generating image with Gemini AI...');
      const imagePrompt = PROMPTS.buildImagePrompt(config.category, subject);
      const timestamp = generateTimestamp();
      const imageName = `${sanitizeFilename(subject)}_${timestamp}.png`;
      const imagePath = path.join(this.outputDir, 'images', imageName);
      
      const imageResult = await this.imageGenerator.generateImage(imagePrompt, imagePath);
      console.log(`   Image saved: ${imagePath}\n`);

      // Step 3: Generate clues with Gemini 2.5 Flash (text)
      console.log('💡 Step 3: Generating clues with Gemini AI...');
      const clues = await this.clueGenerator.generateClues(
        subject,
        config.category,
        config.clues,
        config.duration
      );

      // Step 4: Generate audio (intro + clues + reveal)
      console.log('🎵 Step 4: Generating audio with Edge TTS...');
      const { audioFiles, audioDurations } = await this.ttsEngine.generateRevealAudio(
        subject,
        config.category,
        clues,
        config
      );

      // Step 5: Generate blur stages
      console.log('🔲 Step 5: Generating blur stages...');
      const blurDir = path.join(this.outputDir, 'images', `blur_${sanitizeFilename(subject)}_${timestamp}`);
      const blurData = await this.blurEngine.generateBlurStages(imagePath, blurDir, config);

      // Copy images to public directory for Remotion
      const publicDir = path.join('public', 'output', 'images');
      const publicImagePath = path.join(publicDir, imageName);
      const publicBlurDirName = `blur_${sanitizeFilename(subject)}_${timestamp}`;
      const publicBlurDir = path.join(publicDir, publicBlurDirName);
      
      await fs.mkdir(publicDir, { recursive: true });
      await fs.copyFile(imagePath, publicImagePath);
      
      // Copy blur stages
      await fs.mkdir(publicBlurDir, { recursive: true });
      for (const stage of blurData.stages) {
        const filename = path.basename(stage.path);
        const sourcePath = stage.path;
        const destPath = path.join(publicBlurDir, filename);
        await fs.copyFile(sourcePath, destPath);
      }
      
      // Paths for Remotion (relative to public directory, without 'public/' prefix)
      const remotionImagePath = path.join('output', 'images', imageName);
      const remotionBlurDir = path.join('output', 'images', publicBlurDirName);

      // Step 6: Prepare video data
      console.log('🎬 Step 6: Preparing video data...');
      const videoData = this.prepareVideoData(
        subject,
        config,
        remotionImagePath,
        clues,
        audioFiles,
        audioDurations,
        blurData,
        remotionBlurDir
      );

      // Save video data
      const videoDataPath = await this.saveVideoData(videoData, subject, config);
      console.log(`   Video data saved: ${videoDataPath}\n`);

      // Step 7: Render video with Remotion
      console.log('🎥 Step 7: Rendering video with Remotion...');
      console.log('   (This may take a few minutes...)\n');
      
      const videoPath = await this.renderVideo(videoData, subject, config);

      console.log('\n🎉 SUCCESS! Blur reveal video generated!');
      console.log(`📹 Video: ${videoPath}`);
      console.log(`🖼️  Image: ${imagePath}`);
      console.log(`🎵 Audio: ${this.ttsEngine.audioDir}`);
      console.log(`💡 Clues: ${clues.length}\n`);

      return {
        success: true,
        videoPath,
        imagePath,
        subject,
        clues,
        config,
      };

    } catch (error) {
      console.error('\n❌ Video generation failed:', error.message);
      console.error(error.stack);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Select random subject from category
   */
  selectRandomSubject(category) {
    const subjects = SUBJECT_LIBRARY[category];
    if (!subjects || subjects.length === 0) {
      throw new Error(`No subjects found for category: ${category}`);
    }
    const randomIndex = Math.floor(Math.random() * subjects.length);
    return subjects[randomIndex];
  }

  /**
   * Prepare data for Remotion renderer
   */
  prepareVideoData(subject, config, imagePath, clues, audioFiles, audioDurations, blurData, blurDir) {
    const { duration, output } = config;
    const { fps } = output;

    // Calculate timing
    const introDuration = audioDurations.intro || 3;
    const blurRevealDuration = duration;
    const revealDuration = audioDurations.reveal + 2 || 4;

    // Calculate frame positions
    const introFrames = Math.ceil(introDuration * fps);
    const blurFrames = Math.ceil(blurRevealDuration * fps);
    const revealFrames = Math.ceil(revealDuration * fps);

    // Update blur stage paths to use public directory
    const blurStagesWithPublicPaths = blurData.stages.map(stage => ({
      ...stage,
      path: path.join(blurDir, path.basename(stage.path))
    }));

    return {
      subject,
      category: config.category,
      imagePath: imagePath,
      clues: clues.map((clue, index) => ({
        ...clue,
        audioFile: audioFiles[`clue_${index + 1}`],
        audioDuration: audioDurations[`clue_${index + 1}`] || 2,
      })),
      audio: {
        intro: {
          file: audioFiles.intro,
          duration: introDuration,
        },
        reveal: {
          file: audioFiles.reveal,
          duration: audioDurations.reveal || 2,
        },
      },
      blur: {
        stages: blurStagesWithPublicPaths,
        steps: blurData.steps,
        startResolution: config.blur.startResolution,
        progression: config.blur.progression,
      },
      timing: {
        introFrames,
        blurFrames,
        revealFrames,
        totalFrames: introFrames + blurFrames + revealFrames,
      },
      config: {
        fps,
        width: output.width,
        height: output.height,
        duration: duration,
      },
      metadata: {
        generated_at: new Date().toISOString(),
        watermarked: true,
      },
    };
  }

  /**
   * Save video data for Remotion
   */
  async saveVideoData(videoData, subject, config) {
    const timestamp = generateTimestamp();
    const filename = `video_data_${sanitizeFilename(subject)}_${timestamp}.json`;
    const dataPath = path.join(this.outputDir, 'metadata', filename);
    
    await fs.writeFile(dataPath, JSON.stringify(videoData, null, 2), 'utf-8');
    return dataPath;
  }

  /**
   * Render video using Remotion
   */
  async renderVideo(videoData, subject, config) {
    const timestamp = generateTimestamp();
    const filename = `${config.category}_${sanitizeFilename(subject)}_${timestamp}.mp4`;
    const outputPath = path.join(this.outputDir, 'videos', filename);

    try {
      // Save video data to temp file for Remotion
      const tempDataPath = path.join(this.outputDir, 'temp_video_data.json');
      await fs.writeFile(tempDataPath, JSON.stringify(videoData, null, 2));

      // Get GPU-optimized render options
      const gpuOptions = gpuDetector.getRenderOptions();
      
      console.log('   Render Configuration:');
      console.log(`   - GPU: ${this.gpuInfo.available ? '✅ ' + this.gpuInfo.type : '❌ CPU Only'}`);
      console.log(`   - Performance: ${gpuDetector.getPerformanceEstimate()}`);
      console.log(`   - Options: ${gpuOptions.join(' ')}\n`);

      // Build Remotion render command
      const command = [
        'npx remotion render',
        'remotion/index.tsx',
        'BlurRevealVideo',
        outputPath,
        `--props="${tempDataPath}"`,
        ...gpuOptions,
        '--overwrite',
      ].join(' ');

      console.log('   Running Remotion render...');
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024,
      });

      if (stderr && !stderr.includes('warning')) {
        console.warn('   Remotion output:', stderr);
      }

      // Clean up temp file
      await fs.unlink(tempDataPath).catch(() => {});

      return outputPath;

    } catch (error) {
      throw new Error(`Remotion render failed: ${error.message}`);
    }
  }

  /**
   * Batch generate multiple videos
   */
  async generateBatch(configs) {
    console.log(`🎬 Batch generating ${configs.length} videos...\n`);
    
    const results = [];
    
    for (let i = 0; i < configs.length; i++) {
      console.log(`\n📹 Video ${i + 1}/${configs.length}`);
      console.log('─'.repeat(50));
      
      const result = await this.generateVideo(configs[i]);
      results.push(result);
      
      // Clean audio between videos
      if (i < configs.length - 1) {
        await this.ttsEngine.cleanAudioDir();
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ Batch complete: ${successful}/${configs.length} videos generated`);
    
    return results;
  }

  /**
   * Clean output directory
   */
  async cleanOutput() {
    try {
      const videosDir = path.join(this.outputDir, 'videos');
      const files = await fs.readdir(videosDir);
      for (const file of files) {
        if (file.endsWith('.mp4')) {
          await fs.unlink(path.join(videosDir, file));
        }
      }
      console.log('🧹 Output directory cleaned');
    } catch (error) {
      console.warn('Could not clean output:', error.message);
    }
  }
}

export default Orchestrator;
