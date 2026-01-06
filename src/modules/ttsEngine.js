import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * TTS Engine using Microsoft Edge TTS
 * Generates voiceover narration for blur reveal videos
 */

export class TTSEngine {
  constructor(audioDir = './public') {
    this.audioDir = audioDir;
  }

  /**
   * Initialize audio directory
   */
  async init() {
    try {
      await fs.mkdir(this.audioDir, { recursive: true });
      console.log(`📁 Audio directory ready: ${this.audioDir}`);
    } catch (error) {
      throw new Error(`Failed to create audio directory: ${error.message}`);
    }
  }

  /**
   * Check if edge-tts is installed
   */
  async checkInstallation() {
    try {
      await execAsync('edge-tts --version');
      return true;
    } catch (error) {
      throw new Error(
        'edge-tts not found. Install it with: pip install edge-tts'
      );
    }
  }

  /**
   * Generate audio for a single text segment
   */
  async generateAudio(text, voice, outputFilename) {
    const outputPath = path.join(this.audioDir, outputFilename);

    try {
      const command = `edge-tts --voice "${voice}" --rate=-10% --text "${this.escapeText(text)}" --write-media "${outputPath}"`;

      console.log(`🎙️  Generating: ${outputFilename}`);
      await execAsync(command);

      // Verify file was created
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        throw new Error('Generated audio file is empty');
      }

      return outputPath;
    } catch (error) {
      console.error(`❌ TTS failed for: ${outputFilename}`);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Generate all audio for a blur reveal
   */
  async generateRevealAudio(subject, category, clues, config) {
    await this.init();
    await this.checkInstallation();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionFolder = `${category}_${timestamp}`;
    const sessionPath = path.join(this.audioDir, sessionFolder);
    await fs.mkdir(sessionPath, { recursive: true });

    const audioFiles = {};
    const audioDurations = {};
    const { voice } = config;

    console.log(`\n🎵 Generating audio files...`);
    console.log(`📁 Session: ${sessionFolder}\n`);

    try {
      // Generate intro audio
      const introText = this.getIntroText(category);
      const introFile = path.join(sessionFolder, 'intro.mp3');
      await this.generateAudio(introText, voice.narrator, introFile);
      audioFiles.intro = introFile;
      const introDuration = await this.getAudioDuration(introFile);
      if (introDuration) audioDurations.intro = introDuration;

      // Generate clue audio files
      for (let i = 0; i < clues.length; i++) {
        const clue = clues[i];
        const clueFile = path.join(sessionFolder, `clue_${i + 1}.mp3`);
        const clueText = `${clue.text}`;
        
        await this.generateAudio(clueText, voice.narrator, clueFile);
        audioFiles[`clue_${i + 1}`] = clueFile;
        
        const clueDuration = await this.getAudioDuration(clueFile);
        if (clueDuration) audioDurations[`clue_${i + 1}`] = clueDuration;
      }

      // Generate reveal audio
      const revealText = this.getRevealText(subject);
      const revealFile = path.join(sessionFolder, 'reveal.mp3');
      await this.generateAudio(revealText, voice.reveal, revealFile);
      audioFiles.reveal = revealFile;
      const revealDuration = await this.getAudioDuration(revealFile);
      if (revealDuration) audioDurations.reveal = revealDuration;

      console.log(`\n✅ Generated ${Object.keys(audioFiles).length} audio files\n`);
      
      return { audioFiles, audioDurations };

    } catch (error) {
      console.error(`⚠️  Audio generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get intro text based on category
   */
  getIntroText(category) {
    const intros = {
      monuments: "Can you guess this iconic monument?",
      cars: "Can you identify this legendary car?",
      gym: "What piece of gym equipment is this?",
      animals: "Can you name this animal?",
      food: "What delicious dish is this?",
    };
    return intros[category] || "Can you guess what this is?";
  }

  /**
   * Get reveal text
   */
  getRevealText(subject) {
    return `The answer is... ${subject}!`;
  }

  /**
   * Get audio duration using ffprobe
   */
  async getAudioDuration(filename) {
    const filePath = path.join(this.audioDir, filename);
    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
      const { stdout } = await execAsync(command);
      const duration = parseFloat(stdout.trim());
      return duration || 3; // Default to 3 seconds if detection fails
    } catch (error) {
      console.warn(`⚠️  Could not detect duration for ${filename}, using default 3s`);
      return 3;
    }
  }

  /**
   * Generate cached intro audio
   */
  async generateCachedIntro(category, config) {
    const cacheDir = path.join(this.audioDir, 'cache');
    await fs.mkdir(cacheDir, { recursive: true });

    const cacheFile = path.join(cacheDir, `intro_${category}.mp3`);
    const relativeCacheFile = path.join('cache', `intro_${category}.mp3`);

    try {
      // Check if cached file exists
      await fs.access(cacheFile);
      console.log(`🎵 Using cached intro: ${relativeCacheFile}`);
      const duration = await this.getAudioDuration(relativeCacheFile);
      return { audioFile: relativeCacheFile, duration };
    } catch {
      // Generate new intro
      const text = this.getIntroText(category);
      console.log(`🎙️  Generating intro audio: ${text}`);
      
      const command = `edge-tts --voice "${config.voice.narrator}" --rate=-10% --text "${this.escapeText(text)}" --write-media "${cacheFile}"`;
      await execAsync(command);

      const stats = await fs.stat(cacheFile);
      if (stats.size === 0) {
        throw new Error('Generated intro audio is empty');
      }

      console.log(`✅ Intro audio cached: ${relativeCacheFile}`);
      const duration = await this.getAudioDuration(relativeCacheFile);
      return { audioFile: relativeCacheFile, duration };
    }
  }

  /**
   * Escape text for shell command
   */
  escapeText(text) {
    return text.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  }

  /**
   * Clean audio directory
   */
  async cleanAudioDir() {
    try {
      const files = await fs.readdir(this.audioDir);
      for (const file of files) {
        if (file !== 'cache' && !file.startsWith('.')) {
          const filePath = path.join(this.audioDir, file);
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            await fs.rm(filePath, { recursive: true });
          }
        }
      }
      console.log('🧹 Audio directory cleaned');
    } catch (error) {
      console.warn('Could not clean audio directory:', error.message);
    }
  }
}

export default TTSEngine;
