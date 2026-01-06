import { z } from 'zod';

/**
 * Configuration Schema Validation
 * Ensures all blur reveal configs are type-safe and valid
 */

export const VideoConfigSchema = z.object({
  category: z.string().default('monuments'),
  subject: z.string().optional(), // Specific subject (e.g., "Ferrari", "Taj Mahal")
  duration: z.number().min(3).max(10).default(5), // Blur reveal duration in seconds
  clues: z.number().min(2).max(5).default(3), // Number of clues
  voice: z.object({
    narrator: z.string().default('en-US-AriaNeural'),
    reveal: z.string().default('en-IN-PrabhatNeural'),
  }),
  blur: z.object({
    startResolution: z.number().min(5).max(50).default(10), // Starting pixel grid (10x10)
    progression: z.enum(['linear', 'exponential']).default('exponential'),
  }),
  output: z.object({
    width: z.number().default(1080),
    height: z.number().default(1920),
    fps: z.number().default(30),
    codec: z.string().default('h264'),
  }).optional(),
});

export const ClueSchema = z.object({
  text: z.string(),
  timing: z.number(), // Seconds from start
});

export const RevealDataSchema = z.object({
  subject: z.string(),
  category: z.string(),
  description: z.string(), // Full description for image generation
  clues: z.array(ClueSchema),
  imagePath: z.string(),
  metadata: z.object({
    generated_at: z.string(),
    model: z.string().optional(),
  }).optional(),
});

export default {
  VideoConfigSchema,
  ClueSchema,
  RevealDataSchema,
};
