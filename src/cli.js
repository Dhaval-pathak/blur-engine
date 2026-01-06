#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Orchestrator from './modules/orchestrator.js';
import configManager from './config/configManager.js';
import { SUBJECT_LIBRARY } from './config/prompts.js';
import fs from 'fs/promises';

/**
 * CLI Interface for Blur Reveal Engine
 * Provides command-line access to video generation
 */

const program = new Command();

program
  .name('blur-reveal-engine')
  .description('AI-powered blur reveal video generation system')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a blur reveal video')
  .option('-c, --category <type>', 'Category (monuments|cars|gym)', 'monuments')
  .option('-s, --subject <name>', 'Specific subject (e.g., "Ferrari", "Taj Mahal")')
  .option('-d, --duration <seconds>', 'Blur reveal duration in seconds', '5')
  .option('--clues <number>', 'Number of clues', '3')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--clean', 'Clean audio directory after generation')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🎨 Blur Reveal Engine\n'));

    try {
      // Parse options
      const userConfig = {
        category: options.category,
        subject: options.subject,
        duration: parseInt(options.duration, 10),
        clues: parseInt(options.clues, 10),
      };

      console.log(chalk.gray('CLI Options:'));
      console.log(chalk.gray(`  Category: ${options.category}`));
      if (options.subject) {
        console.log(chalk.gray(`  Subject: ${options.subject}`));
      } else {
        console.log(chalk.gray(`  Subject: random from category`));
      }
      console.log(chalk.gray(`  Duration: ${options.duration}s`));
      console.log(chalk.gray(`  Clues: ${options.clues}`));
      console.log('');

      // Initialize orchestrator
      const spinner = ora('Initializing...').start();
      const orchestrator = new Orchestrator();
      await orchestrator.init();
      spinner.succeed('Initialized');

      // Generate video
      spinner.start('Generating blur reveal video...');
      const result = await orchestrator.generateVideo(userConfig);

      if (result.success) {
        spinner.succeed('Video generated successfully!');
        console.log(chalk.green('\n✅ Output:'));
        console.log(chalk.white(`   Video: ${result.videoPath}`));
        console.log(chalk.white(`   Image: ${result.imagePath}`));
        console.log(chalk.white(`   Subject: ${result.subject}`));
        console.log(chalk.white(`   Clues: ${result.clues.length}`));
        
        // Clean audio if requested
        if (options.clean) {
          await orchestrator.ttsEngine.cleanAudioDir();
        }
      } else {
        spinner.fail('Video generation failed');
        console.error(chalk.red(`\n❌ Error: ${result.error}`));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red(`\n❌ Fatal Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Generate multiple videos from a config file')
  .requiredOption('-f, --file <path>', 'Path to batch config JSON file')
  .option('--max <count>', 'Maximum videos to generate', '20')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🎬 Batch Video Generation\n'));

    try {
      // Read batch config
      const configPath = options.file;
      const configContent = await fs.readFile(configPath, 'utf-8');
      const configs = JSON.parse(configContent);

      const maxVideos = parseInt(options.max, 10);
      const videosToGenerate = configs.slice(0, maxVideos);

      console.log(chalk.white(`📋 Loaded ${configs.length} configurations`));
      console.log(chalk.white(`🎬 Generating ${videosToGenerate.length} videos\n`));

      // Initialize
      const orchestrator = new Orchestrator();
      await orchestrator.init();

      // Generate batch
      const results = await orchestrator.generateBatch(videosToGenerate);

      const successful = results.filter(r => r.success).length;
      console.log(chalk.green(`\n✅ Batch complete: ${successful}/${videosToGenerate.length} videos`));

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available subjects by category')
  .option('-c, --category <type>', 'Category to list')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n📚 Available Subjects\n'));

    try {
      if (options.category) {
        const subjects = SUBJECT_LIBRARY[options.category];
        if (!subjects) {
          console.log(chalk.red(`❌ Category not found: ${options.category}`));
          console.log(chalk.white(`Available categories: ${Object.keys(SUBJECT_LIBRARY).join(', ')}`));
          return;
        }

        console.log(chalk.white(`Category: ${chalk.cyan(options.category)}`));
        console.log(chalk.white(`Total: ${chalk.cyan(subjects.length)} subjects\n`));
        
        subjects.forEach((subject, index) => {
          console.log(chalk.white(`  ${index + 1}. ${subject}`));
        });
      } else {
        // List all categories
        console.log(chalk.white('Available Categories:\n'));
        Object.entries(SUBJECT_LIBRARY).forEach(([category, subjects]) => {
          console.log(chalk.cyan(`${category}:`));
          console.log(chalk.white(`  ${subjects.length} subjects`));
          console.log(chalk.gray(`  Examples: ${subjects.slice(0, 3).join(', ')}...\n`));
        });
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  });

program
  .command('test')
  .description('Test system configuration')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🔧 Testing Configuration\n'));

    try {
      // Check environment
      console.log('Checking environment variables...');
      configManager.validateEnv();
      console.log(chalk.green('✓ Environment variables OK'));

      // Check TTS
      console.log('\nChecking Edge TTS installation...');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync('edge-tts --version');
        console.log(chalk.green('✓ Edge TTS installed'));
      } catch {
        console.log(chalk.yellow('⚠ Edge TTS not found'));
        console.log(chalk.white('  Install with: pip install edge-tts'));
      }

      // Check Remotion
      console.log('\nChecking Remotion installation...');
      try {
        await execAsync('npx remotion --version');
        console.log(chalk.green('✓ Remotion installed'));
      } catch {
        console.log(chalk.yellow('⚠ Remotion not found'));
        console.log(chalk.white('  Run: npm install'));
      }

      // Check Sharp (image processing)
      console.log('\nChecking Sharp (image processing)...');
      try {
        await import('sharp');
        console.log(chalk.green('✓ Sharp installed'));
      } catch {
        console.log(chalk.yellow('⚠ Sharp not found'));
        console.log(chalk.white('  Run: npm install sharp'));
      }

      console.log(chalk.green('\n✅ Configuration test complete\n'));

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

program
  .command('voices')
  .description('List available TTS voices')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🎙️  Available TTS Voices\n'));

    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('edge-tts --list-voices');
      console.log(stdout);

    } catch (error) {
      console.error(chalk.red('❌ Could not list voices'));
      console.error(chalk.white('Make sure edge-tts is installed: pip install edge-tts'));
    }
  });

program.parse();
