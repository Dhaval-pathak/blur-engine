/**
 * Utility Functions
 */

/**
 * Format duration from seconds
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate timestamp
 */
export function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/__+/g, '_')
    .toLowerCase();
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.log(`   Retry attempt ${attempt}/${maxAttempts} after ${delay}ms...`);
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
}

/**
 * Calculate blur progression steps
 * Returns array of resolution values from start to end
 */
export function calculateBlurSteps(startResolution, endWidth, endHeight, frames, progression = 'exponential') {
  const steps = [];
  const totalSteps = frames;

  for (let i = 0; i <= totalSteps; i++) {
    let progress;
    
    if (progression === 'exponential') {
      // Exponential: slower at start, faster at end (more dramatic reveal)
      progress = Math.pow(i / totalSteps, 2);
    } else {
      // Linear: constant speed
      progress = i / totalSteps;
    }

    // Calculate width and height for this step
    const width = Math.round(startResolution + (endWidth - startResolution) * progress);
    const height = Math.round(startResolution + (endHeight - startResolution) * progress);
    
    steps.push({ width, height, frame: i });
  }

  return steps;
}

/**
 * Deep merge objects
 */
export function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export default {
  formatDuration,
  generateTimestamp,
  sanitizeFilename,
  sleep,
  retry,
  calculateBlurSteps,
  deepMerge,
};
