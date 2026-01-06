/**
 * AI Prompts Configuration
 * All static prompts for image generation and clue creation
 */

export const PROMPTS = {
  /**
   * Image Generation Prompt Template
   * Used with Gemini 2.5 Flash Image
   */
  IMAGE_GENERATION: `Generate a high-quality, photorealistic image optimized for mobile viewing (vertical format).

Requirements:
- Resolution: 1080x1920 (9:16 aspect ratio)
- Style: Photorealistic, professional photography
- Lighting: High contrast, clear details
- Background: Clean and uncluttered (solid or contextual)
- Composition: Centered subject, symmetrical when appropriate
- Quality: 8K detail, sharp focus
- SynthID: Include digital watermark (automatic in 2026)

The image must be immediately recognizable even when viewed on small smartphone screens.
Subject must have clear visual features that work well with progressive de-pixelation.

Return only the generated image, no text or annotations.`,

  /**
   * Clue Generation Prompt
   * Used with Gemini 2.5 Flash (text)
   */
  CLUE_GENERATION: `You are a game host creating engaging clues for a visual guessing game.

The game shows a blurred image that gradually becomes clearer over 5 seconds.
Your job is to create clues that build tension and guide players without giving away the answer too early.

Requirements:
- Generate exactly {clueCount} clues
- Each clue must be 6-10 words (mobile readability)
- Progression: vague → specific
- First clue: Category or general feature
- Middle clues: Specific characteristics, location, or context
- Last clue: Strong hint but not the exact answer
- Use simple vocabulary (8th grade reading level)
- Make clues exciting and engaging

Format your response as a JSON object:
{
  "clues": [
    {"text": "First clue text", "timing": 1.5},
    {"text": "Second clue text", "timing": 3.0},
    {"text": "Third clue text", "timing": 4.5}
  ]
}

Important:
- Clue timings should be evenly spaced during the blur reveal
- Return only valid JSON, no additional text`,

  /**
   * Build topic-specific image prompt
   */
  buildImagePrompt: (category, subject) => {
    const categoryPrompts = {
      monuments: `A photorealistic image of {subject}, iconic monument, front view, clear blue sky, daytime, high resolution architectural photography, symmetrical composition, vivid colors, professional travel photography, 8K quality, vertical format 9:16`,
      
      cars: `A photorealistic {subject} sports car, 3/4 front view, studio lighting, high contrast, sharp details, solid color background, professional automotive photography, 8K quality, vertical format 9:16, dramatic lighting`,
      
      gym: `A photorealistic {subject}, professional fitness equipment photography, studio lighting, high contrast, clean background, sharp details, chrome and black finish, 8K quality, vertical format 9:16`,
      
      animals: `A photorealistic {subject}, wildlife photography, natural lighting, shallow depth of field, sharp focus on subject, blurred background, professional nature photography, 8K quality, vertical format 9:16`,
      
      food: `A photorealistic {subject}, professional food photography, dramatic lighting, high contrast, elegant presentation, shallow depth of field, 8K quality, vertical format 9:16`,
    };

    const template = categoryPrompts[category] || categoryPrompts.monuments;
    return template.replace('{subject}', subject);
  },

  /**
   * Build clue generation prompt with context
   */
  buildCluePrompt: (subject, category, clueCount) => {
    let contextExamples = '';
    
    if (category === 'monuments') {
      contextExamples = `
Example for "Taj Mahal":
Clue 1: "This iconic monument is located in India" (timing: 1.5)
Clue 2: "Built in the 17th century as a symbol of love" (timing: 3.0)
Clue 3: "Famous for its white marble dome and minarets" (timing: 4.5)`;
    } else if (category === 'cars') {
      contextExamples = `
Example for "Ferrari F8":
Clue 1: "This Italian sports car brand uses a prancing horse" (timing: 1.5)
Clue 2: "Known for its distinctive red color and V8 engine" (timing: 3.0)
Clue 3: "One of Ferrari's mid-engine supercars from 2019" (timing: 4.5)`;
    } else if (category === 'gym') {
      contextExamples = `
Example for "Dumbbell":
Clue 1: "This is a piece of strength training equipment" (timing: 1.5)
Clue 2: "Used in pairs for balanced muscle development" (timing: 3.0)
Clue 3: "Handheld weight with a handle in the middle" (timing: 4.5)`;
    }

    return `${PROMPTS.CLUE_GENERATION}

Subject: ${subject}
Category: ${category}
Number of clues: ${clueCount}
${contextExamples}

Now generate ${clueCount} clues for: "${subject}"`;
  },

  /**
   * Voiceover Script Templates
   */
  VOICEOVER: {
    INTRO: (category) => {
      const categoryTexts = {
        monuments: "Can you guess this iconic monument?",
        cars: "Can you identify this legendary car?",
        gym: "What piece of gym equipment is this?",
        animals: "Can you name this animal?",
        food: "What delicious dish is this?",
      };
      return categoryTexts[category] || "Can you guess what this is?";
    },
    
    REVEAL: (subject) => `The answer is... ${subject}!`,
    
    CLUE_PREFIX: "Here's a clue:",
  },

  /**
   * Error Messages
   */
  ERRORS: {
    IMAGE_GENERATION_FAILED: "Failed to generate image. Please try again",
    CLUE_GENERATION_FAILED: "Failed to generate clues. Using default clues",
    INVALID_SUBJECT: "Subject not found in category library",
    API_FAILURE: "API request failed. Check your connection and API key",
  },

  /**
   * Success Messages
   */
  SUCCESS: {
    IMAGE_GENERATED: "Image generated successfully with SynthID watermark",
    CLUES_GENERATED: "Clues generated successfully",
    VIDEO_RENDERED: "Blur reveal video rendered successfully",
  },
};

/**
 * Subject library by category
 */
export const SUBJECT_LIBRARY = {
  monuments: [
    'Taj Mahal',
    'Eiffel Tower',
    'Colosseum',
    'Great Wall of China',
    'Statue of Liberty',
    'Big Ben',
    'Burj Khalifa',
    'Sydney Opera House',
    'Machu Picchu',
    'Pyramids of Giza',
    'Christ the Redeemer',
    'Leaning Tower of Pisa',
    'Stonehenge',
    'Angkor Wat',
    'Golden Gate Bridge',
    'Mount Rushmore',
    'Petra',
    'Acropolis',
    'Notre-Dame Cathedral',
    'Saint Basil\'s Cathedral',
  ],
  
  cars: [
    'Ferrari F8 Tributo',
    'Lamborghini Aventador',
    'Porsche 911',
    'McLaren 720S',
    'Bugatti Chiron',
    'Aston Martin DB11',
    'Chevrolet Corvette',
    'Ford Mustang',
    'Dodge Challenger',
    'Tesla Model S',
    'BMW M3',
    'Mercedes-AMG GT',
    'Audi R8',
    'Nissan GT-R',
    'Toyota Supra',
    'Honda NSX',
    'Jaguar F-Type',
    'Maserati MC20',
    'Alfa Romeo Giulia',
    'Lexus LC 500',
  ],
  
  gym: [
    'Dumbbell',
    'Barbell',
    'Kettlebell',
    'Bench Press',
    'Squat Rack',
    'Treadmill',
    'Rowing Machine',
    'Pull-up Bar',
    'Medicine Ball',
    'Resistance Bands',
    'Battle Ropes',
    'Weight Plates',
    'Cable Machine',
    'Leg Press',
    'Smith Machine',
    'Lat Pulldown',
    'Elliptical',
    'Exercise Bike',
    'Foam Roller',
    'Ab Wheel',
  ],
};

export default PROMPTS;
