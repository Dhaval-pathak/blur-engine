import Orchestrator from './modules/orchestrator.js';
import configManager from './config/configManager.js';

/**
 * Main Entry Point
 * Programmatic API for blur reveal video generation
 */

export { Orchestrator, configManager };

export async function generateVideo(config = {}) {
  const orchestrator = new Orchestrator();
  await orchestrator.init();
  return orchestrator.generateVideo(config);
}

export async function generateBatch(configs = []) {
  const orchestrator = new Orchestrator();
  await orchestrator.init();
  return orchestrator.generateBatch(configs);
}

// Default export
export default {
  generateVideo,
  generateBatch,
  Orchestrator,
  configManager,
};
