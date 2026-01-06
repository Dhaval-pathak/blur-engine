# Setup Guide

## Quick Setup

### 1. Install Node.js Dependencies
```bash
cd blur-engine
npm install
```

### 2. Install Python Dependencies (Edge TTS)
```bash
# Using pip
pip install edge-tts

# Or using pip3
pip3 install edge-tts
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env
```

Required in `.env`:
```
GEMINI_API_KEY=your_key_here
```

### 4. Test Installation
```bash
npm run generate test
```

### 5. Generate Your First Video
```bash
npm run generate generate
```

## Troubleshooting

### Edge TTS not found
```bash
pip install edge-tts
# or
pip3 install edge-tts
```

### Remotion not found
```bash
npm install
```

### Sharp installation issues
```bash
npm install --force sharp
```

### API Key issues
- Get API key from: https://aistudio.google.com/apikey
- Add to `.env` file: `GEMINI_API_KEY=your_key_here`

## Next Steps

1. Try different categories: `npm run generate list`
2. Generate batch videos: `npm run generate batch -- --file configs/batch-example.json`
3. Customize settings in `.env` file
4. Add your own subjects to `src/config/prompts.js`
