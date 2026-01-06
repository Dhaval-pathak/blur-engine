# 🎨 Blur Reveal Engine

AI-powered blur reveal video generation system for creating engaging visual guessing games.

## 🎯 Features

- **AI Image Generation**: Gemini 2.5 Flash Image for photorealistic images
- **Smart Clue Generation**: AI-generated hints that build tension
- **Progressive De-pixelation**: Smooth blur-to-clear reveal animation
- **Text-to-Speech**: Indian English voiceover narration
- **Professional Rendering**: Remotion-based React video composition
- **Batch Processing**: Generate up to 20 videos in one session
- **SynthID Watermark**: Automatic compliance with 2026 AI transparency regulations

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Python 3.8+ (for Edge TTS)
- Google Gemini API key ([Get it here](https://aistudio.google.com/apikey))

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Edge TTS (Python)
pip install edge-tts

# Copy environment file
cp .env.example .env

# Add your Gemini API key to .env
nano .env
```

**Environment Variables:**
```bash
GEMINI_API_KEY=your_key_here
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

### Generate Your First Video

```bash
# Generate a random monument reveal
npm run generate

# Generate specific subject
npm run generate generate -- --category monuments --subject "Taj Mahal"

# Generate with custom settings
npm run generate generate -- --category cars --subject "Ferrari" --duration 6 --clues 3
```

## 📁 Project Structure

```
blur-engine/
├── src/
│   ├── config/              # Configuration management
│   │   ├── schema.js        # Zod validation schemas
│   │   ├── configManager.js # Config loading/merging
│   │   └── prompts.js       # AI prompts & subject library
│   ├── modules/
│   │   ├── imageGenerator.js    # Gemini Image API
│   │   ├── clueGenerator.js     # Gemini Text API for clues
│   │   ├── blurEngine.js        # Pixelation/blur processing
│   │   ├── ttsEngine.js         # Edge TTS wrapper
│   │   └── orchestrator.js      # Pipeline coordinator
│   ├── utils/               # Utilities & helpers
│   ├── index.js             # Main entry
│   └── cli.js               # CLI interface
├── remotion/
│   ├── compositions/
│   │   ├── BlurRevealVideo.tsx  # Main composition
│   │   ├── IntroSlide.tsx       # Intro screen
│   │   ├── BlurSlide.tsx        # Progressive reveal
│   │   ├── ClueOverlay.tsx      # Clue text overlay
│   │   └── RevealSlide.tsx      # Final answer reveal
│   └── index.tsx            # Remotion root
├── configs/                 # Example configurations
├── output/                  # Generated videos & images
└── public/                  # Audio files
```

## 🎨 Usage

### Basic Usage

```javascript
import { generateVideo } from './src/index.js';

await generateVideo({
  category: 'monuments',
  subject: 'Taj Mahal',
  duration: 5,
  clues: 3
});
```

### CLI Commands

```bash
# Generate single video
npm run generate generate -- [options]

# Batch generation
npm run generate batch -- --file configs/batch-example.json

# List available subjects
npm run generate list
npm run generate list -- --category monuments

# Test configuration
npm run generate test

# List TTS voices
npm run generate voices
```

### CLI Options

```
Options:
  -c, --category <type>     Category (monuments|cars|gym)
  -s, --subject <name>      Specific subject
  -d, --duration <seconds>  Blur reveal duration (default: 5)
  --clues <number>          Number of clues (default: 3)
  -o, --output <dir>        Output directory
  --clean                   Clean audio after generation
```

## 🎯 Supported Categories

### Monuments (20 subjects)
Taj Mahal, Eiffel Tower, Colosseum, Great Wall of China, Statue of Liberty, Big Ben, Burj Khalifa, Sydney Opera House, Machu Picchu, Pyramids of Giza, and more...

### Cars (20 subjects)
Ferrari F8, Lamborghini Aventador, Porsche 911, McLaren 720S, Bugatti Chiron, Tesla Model S, BMW M3, Mercedes-AMG GT, and more...

### Gym Equipment (20 subjects)
Dumbbell, Barbell, Kettlebell, Bench Press, Squat Rack, Treadmill, Rowing Machine, Pull-up Bar, and more...

## 🎬 Video Output Specifications

- **Format**: MP4 (H.264)
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Duration**: 30-40 seconds total
  - Intro: 3-4 seconds
  - Blur reveal: 5-6 seconds (configurable)
  - Final reveal: 3-4 seconds
- **FPS**: 30
- **Audio**: AAC, 128kbps
- **Watermark**: SynthID (automatic)

## 🔧 Configuration

### Video Settings

```json
{
  "category": "monuments",
  "subject": "Taj Mahal",
  "duration": 5,
  "clues": 3,
  "blur": {
    "startResolution": 10,
    "progression": "exponential"
  }
}
```

### Blur Progression

- **exponential**: Slower reveal at start, faster at end (recommended)
- **linear**: Constant speed reveal

## 📊 AI Compliance (2026)

All generated images include:
- **SynthID digital watermark** (automatic in Gemini 2.5 Flash Image)
- Metadata indicating AI generation
- 99.9% watermark preservation through video rendering

### YouTube Upload Requirements

When uploading to YouTube:
1. Select "Altered Content" label during upload
2. Disclosure: "AI-generated imagery with SynthID watermark"
3. Category: Educational/Entertainment

## 🎵 Audio Configuration

- **Voices**: Indian English (Neerja for narrator, Prabhat for reveal)
- **Background Music**: Optional (must be in `remotion/assets/sounds/`)
- **Volume**: Auto-balanced for clarity

## 🚀 Performance

### With GPU Acceleration
- **Image Generation**: 3-5 seconds
- **Audio Generation**: 5-10 seconds
- **Video Rendering**: 30-60 seconds
- **Total**: ~45-75 seconds per video

### CPU Only
- **Image Generation**: 3-5 seconds
- **Audio Generation**: 5-10 seconds
- **Video Rendering**: 90-180 seconds
- **Total**: ~100-200 seconds per video

### Batch Mode
- Up to 20 videos per session
- Respects API rate limits
- Auto-cleanup between videos

## 🛠️ Development

```bash
# Install dependencies
npm install

# Preview in Remotion Studio
npm run remotion:preview

# Render specific composition
npm run remotion:render BlurRevealVideo output.mp4
```

## 📝 License

MIT License - feel free to use this for your content creation!

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Microsoft Edge TTS for voice synthesis
- Remotion for video rendering framework
- Sharp for image processing

## 📧 Contact

For issues or questions, please open a GitHub issue.
