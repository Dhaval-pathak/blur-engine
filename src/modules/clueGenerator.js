import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClueSchema } from '../config/schema.js';
import { PROMPTS } from '../config/prompts.js';
import { retry } from '../utils/helpers.js';

/**
 * Clue Generator using Gemini 2.5 Flash (text)
 * Generates engaging clues for the blur reveal game
 */

export class ClueGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required for clue generation');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    console.log(`💡 Using text model for clues: ${modelName}`);
  }

  /**
   * Generate clues for a subject
   */
  async generateClues(subject, category, clueCount, duration) {
    try {
      console.log(`💡 Generating ${clueCount} clues for: ${subject}...`);

      const prompt = PROMPTS.buildCluePrompt(subject, category, clueCount);

      // Generate clues with retry
      const result = await retry(async () => {
        return await this.model.generateContent(prompt);
      }, 3, 1000);

      const response = await result.response;
      let text = response.text();

      // Clean JSON response
      text = this.cleanJsonResponse(text);
      const parsed = JSON.parse(text);

      if (!parsed.clues || !Array.isArray(parsed.clues)) {
        throw new Error('Invalid clue format');
      }

      // Validate and adjust timings based on duration
      const clues = this.adjustClueTimings(parsed.clues, duration, clueCount);

      // Validate each clue
      clues.forEach((clue, index) => {
        ClueSchema.parse(clue);
        console.log(`   Clue ${index + 1} (${clue.timing}s): "${clue.text}"`);
      });

      console.log(`✅ Generated ${clues.length} clues\n`);
      return clues;

    } catch (error) {
      console.error(`❌ Clue generation failed: ${error.message}`);
      // Return default clues as fallback
      return this.getDefaultClues(subject, category, clueCount, duration);
    }
  }

  /**
   * Adjust clue timings to fit within duration
   */
  adjustClueTimings(clues, duration, expectedCount) {
    // Ensure we have the right number of clues
    if (clues.length < expectedCount) {
      console.warn(`⚠️  Expected ${expectedCount} clues, got ${clues.length}`);
    }

    // Space clues evenly during the blur reveal
    const adjusted = clues.slice(0, expectedCount).map((clue, index) => {
      const timing = (duration / (expectedCount + 1)) * (index + 1);
      return {
        text: clue.text,
        timing: Math.round(timing * 10) / 10, // Round to 1 decimal
      };
    });

    return adjusted;
  }

  /**
   * Get default clues as fallback
   */
  getDefaultClues(subject, category, count, duration) {
    console.warn('⚠️  Using default clues as fallback');

    const defaultClues = {
      monuments: [
        { text: 'This is an iconic monument', timing: 1.5 },
        { text: 'Known worldwide for its beauty', timing: 3.0 },
        { text: `This is the famous ${subject}`, timing: 4.5 },
      ],
      cars: [
        { text: 'This is a luxury sports car', timing: 1.5 },
        { text: 'Known for speed and performance', timing: 3.0 },
        { text: `This is the legendary ${subject}`, timing: 4.5 },
      ],
      gym: [
        { text: 'This is gym equipment', timing: 1.5 },
        { text: 'Used for strength training', timing: 3.0 },
        { text: `This is a ${subject}`, timing: 4.5 },
      ],
    };

    const categoryClues = defaultClues[category] || defaultClues.monuments;
    return this.adjustClueTimings(categoryClues, duration, count);
  }

  /**
   * Clean JSON response
   */
  cleanJsonResponse(text) {
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();
    return text;
  }
}

export default ClueGenerator;
