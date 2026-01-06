# Blur Reveal Engine - Project Summary

## 🎯 What This Project Does

Automatically generates **AI-powered "blur reveal" videos** where viewers guess what's behind a progressively clearing pixelated image. Perfect for YouTube Shorts, TikTok, and Instagram Reels.

**Example Output:** 30-40 second video showing a heavily pixelated image that gradually becomes clear over 5 seconds, with AI-generated clues appearing as overlays, and voiceover narration guiding the viewer.

---

## 🔄 Technical Pipeline

### **Step 1: Subject Selection**
- **Input:** CLI command with category and optional subject
  ```bash
  npm run generate generate -- --category cars --subject "Ferrari" --duration 5 --clues 3
  ```
- **Process:** 
  - If subject specified: use it
  - If not: randomly select from category library (20 subjects per category)
- **Output:** Subject name (e.g., "Ferrari F8 Tributo")

### **Step 2: Image Generation**
- **Input:** Subject + category
- **Process:**
  - Builds detailed prompt using `buildImagePrompt()`:
    ```
    "A photorealistic Ferrari F8 Tributo sports car, 3/4 front view, 
    studio lighting, high contrast, 8K quality, vertical format 9:16"
    ```
  - Calls Gemini 2.5 Flash Image API
  - Automatically includes SynthID watermark (2026 compliance)
- **Output:** High-resolution PNG image (1080x1920)
  ```
  output/images/ferrari_f8_tributo_2026-01-05T10-30-00.png
  ```

### **Step 3: Clue Generation**
- **Input:** Subject, category, clue count
- **Process:**
  - Uses Gemini 2.5 Flash (text model)
  - Generates progressive clues (vague → specific)
  - Validates format and timing
- **Output:** Array of clues with timing
  ```json
  [
    {"text": "This Italian sports car uses a prancing horse logo", "timing": 1.5},
    {"text": "Known for its red color and powerful V8 engine", "timing": 3.0},
    {"text": "One of Ferrari's mid-engine supercars", "timing": 4.5}
  ]
  ```

### **Step 4: Audio Generation (TTS)**
- **Input:** Subject, category, clues
- **Process:**
  - Uses Microsoft Edge TTS
  - Indian English voices (Neerja for narrator, Prabhat for reveal)
  - Generates 3 types of audio:
    1. **Intro**: "Can you identify this legendary car?"
    2. **Clues**: Each clue as separate MP3
    3. **Reveal**: "The answer is... Ferrari F8 Tributo!"
  - Uses ffprobe to detect exact audio durations
- **Output:** Session folder with MP3 files
  ```
  public/cars_2026-01-05T10-30-00/
  ├── intro.mp3
  ├── clue_1.mp3
  ├── clue_2.mp3
  ├── clue_3.mp3
  └── reveal.mp3
  ```

### **Step 5: Blur Stage Generation**
- **Input:** Generated image, blur configuration
- **Process:**
  - Uses Sharp.js for image processing
  - Calculates blur progression (exponential for dramatic effect)
  - Generates sample blur stages (every 10 frames)
  - **Algorithm:**
    - Start: 10x10 pixels (highly pixelated)
    - End: 1080x1920 pixels (clear)
    - Progression: exponential (slow → fast reveal)
- **Output:** Multiple blur stage images + interpolation data
  ```
  output/images/blur_ferrari_f8_tributo_2026-01-05T10-30-00/
  ├── blur_stage_0000.jpg (10x10 scaled up - very pixelated)
  ├── blur_stage_0030.jpg (50x50 scaled up)
  ├── blur_stage_0060.jpg (200x200 scaled up)
  ├── ...
  └── blur_stage_final.jpg (1080x1920 - clear)
  ```

### **Step 6: Video Data Preparation**
- **Input:** All assets from previous steps
- **Process:**
  - Calculates frame timings based on audio durations
  - Assembles complete video data structure
  - Maps clues to specific frames
- **Output:** JSON metadata file
  ```json
  {
    "subject": "Ferrari F8 Tributo",
    "category": "cars",
    "imagePath": "output/images/ferrari_f8_tributo_2026-01-05T10-30-00.png",
    "clues": [...],
    "audio": {...},
    "blur": {...},
    "timing": {
      "introFrames": 90,
      "blurFrames": 150,
      "revealFrames": 120,
      "totalFrames": 360
    }
  }
  ```

### **Step 7: Video Rendering (Remotion)**
- **Input:** Video data JSON
- **Process:**
  - Remotion reads JSON and renders React components
  - **Timeline:**
    1. **Intro Slide** (0-3s): Purple gradient background, "Can you guess?"
    2. **Blur Slide** (3-8s): Progressive de-pixelation with clue overlays
    3. **Reveal Slide** (8-12s): Clear image + answer + confetti
  - Uses GPU acceleration if available (NVIDIA/Intel/AMD)
  - Codec: H.264 for compatibility
- **Output:** Final MP4 video
  ```
  output/videos/cars_ferrari_f8_tributo_2026-01-05T10-30-00.mp4
  ```

---

## 📂 Project Structure

```
blur-engine/
├── package.json                    # Dependencies (Remotion, Gemini, Sharp, etc.)
├── tsconfig.json                   # TypeScript config for Remotion
├── .env                            # API keys and settings
├── README.md                       # Complete documentation
├── SETUP.md                        # Quick start guide
├── GENERATION-COMMANDS.txt         # Ready-to-use CLI commands
│
├── src/                            # Core Node.js application
│   ├── cli.js                      # CLI interface (Commander.js)
│   ├── index.js                    # Main exports
│   │
│   ├── config/
│   │   ├── configManager.js        # Config loading/validation
│   │   ├── schema.js               # Zod schemas
│   │   └── prompts.js              # AI prompts + 60 subject library
│   │
│   ├── modules/
│   │   ├── imageGenerator.js       # Gemini 2.5 Flash Image API
│   │   ├── clueGenerator.js        # Gemini 2.5 Flash (text) for clues
│   │   ├── blurEngine.js           # Sharp.js pixelation/blur processing
│   │   ├── ttsEngine.js            # Edge TTS wrapper
│   │   └── orchestrator.js         # Pipeline coordinator (main logic)
│   │
│   └── utils/
│       ├── logger.js               # Colored console logging
│       ├── helpers.js              # Blur calculation utilities
│       └── gpuDetector.js          # GPU detection for rendering
│
├── remotion/                       # Video rendering (React/TypeScript)
│   ├── index.tsx                   # Composition registration
│   │
│   └── compositions/
│       ├── BlurRevealVideo.tsx     # Main orchestrator
│       ├── IntroSlide.tsx          # Animated intro (gradient background)
│       ├── BlurSlide.tsx           # Progressive reveal with CSS blur
│       ├── ClueOverlay.tsx         # Clue text cards
│       └── RevealSlide.tsx         # Final answer + confetti
│
├── configs/                        # Example configurations
│   ├── monuments-example.json      # Single monument
│   ├── cars-example.json           # Single car
│   ├── gym-example.json            # Random gym equipment
│   └── batch-example.json          # 7 videos at once
│
├── output/                         # Generated content
│   ├── images/                     # AI-generated images + blur stages
│   ├── videos/                     # Final rendered MP4 files
│   └── metadata/                   # Pipeline data (JSON)
│
└── public/                         # Audio files
    ├── cache/                      # Cached intro audio (reusable)
    └── [session_folders]/          # Temporary audio per generation
```

---

## ✨ Key Features

### 1. **AI Image Generation**
- **Model**: Gemini 2.5 Flash Image
- **Resolution**: 1080x1920 (vertical)
- **Quality**: Photorealistic, 8K detail
- **Watermark**: SynthID automatic
- **Prompt Engineering**: Category-specific templates

### 2. **Smart Clue System**
- **AI-Generated**: Gemini 2.5 Flash (text)
- **Progressive Hints**: Vague → specific
- **Mobile-Optimized**: 6-10 words per clue
- **Timed Overlays**: Appear during blur reveal
- **Fallback**: Default clues if AI fails

### 3. **Advanced Blur Engine**
- **Algorithm**: Exponential progression (dramatic reveal)
- **Start**: 10x10 pixels (highly obscured)
- **End**: 1080x1920 pixels (crystal clear)
- **Processing**: Sharp.js with pixelated interpolation
- **Real-time**: CSS blur + scale in Remotion

### 4. **Professional Audio**
- **Voices**: Indian English (Neerja & Prabhat)
- **Types**: Intro, clues, reveal
- **Caching**: Intro audio reused across videos
- **Timing**: Auto-detected with ffprobe
- **Graceful Degradation**: Missing audio doesn't break render

### 5. **GPU Acceleration**
- **Detection**: Automatic (NVIDIA/Intel/AMD)
- **Performance**: 3-5x faster rendering
- **Fallback**: CPU software rendering
- **Options**: Dynamic Remotion flags

### 6. **Batch Processing**
- **Capacity**: Up to 20 videos per session
- **Rate Limiting**: Respects API limits
- **Auto-Cleanup**: Audio cleaned between videos
- **Progress Tracking**: Real-time console updates

---

## 🎨 Visual Design

### **Intro Slide**
- Purple gradient background (animated rotation)
- Animated concentric circles
- "Can You Guess?" title
- Category badge
- 3-4 seconds duration

### **Blur Reveal Slide**
- Black background
- Progressive de-pixelation (CSS transform + blur filter)
- Progress bar at bottom
- Vignette overlay
- 5-6 seconds duration

### **Clue Overlays**
- Semi-transparent dark cards
- Colored borders (green/orange/red/blue/purple)
- "💡 Clue {n}" label
- Large, readable text (42px)
- Pop-in animation

### **Reveal Slide**
- Dark gradient background (blue-gray)
- Clear full image (centered)
- "✓ The Answer Is" label (green)
- Large subject name (64px)
- Confetti animation (15 particles)
- Celebration emoji (🎉)

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Images** | Gemini 2.5 Flash Image | Photorealistic image generation |
| **AI Text** | Gemini 2.5 Flash | Clue generation |
| **TTS** | Microsoft Edge TTS | Voiceover narration |
| **Image Processing** | Sharp.js | Blur/pixelation effects |
| **Video Rendering** | Remotion (React) | Composition & animation |
| **CLI** | Commander.js | Command-line interface |
| **Validation** | Zod | Type-safe schemas |
| **Runtime** | Node.js 18+ | JavaScript execution |

---

## ⏱️ Performance Targets

### **With GPU (NVIDIA/Intel/AMD)**
- Image Generation: 3-5 seconds
- Clue Generation: 2-3 seconds
- Audio Generation: 5-10 seconds
- Video Rendering: 30-60 seconds
- **Total: ~45-80 seconds per video**

### **CPU Only**
- Image Generation: 3-5 seconds
- Clue Generation: 2-3 seconds
- Audio Generation: 5-10 seconds
- Video Rendering: 90-180 seconds
- **Total: ~100-200 seconds per video**

### **Batch Mode (20 videos)**
- Total time: ~15-25 minutes (with GPU)
- Auto-cleanup: Yes
- Rate limiting: Automatic

---

## 📊 Subject Library (60 Total)

### **Monuments (20)**
Taj Mahal, Eiffel Tower, Colosseum, Great Wall of China, Statue of Liberty, Big Ben, Burj Khalifa, Sydney Opera House, Machu Picchu, Pyramids of Giza, Christ the Redeemer, Leaning Tower of Pisa, Stonehenge, Angkor Wat, Golden Gate Bridge, Mount Rushmore, Petra, Acropolis, Notre-Dame, Saint Basil's Cathedral

### **Cars (20)**
Ferrari F8, Lamborghini Aventador, Porsche 911, McLaren 720S, Bugatti Chiron, Aston Martin DB11, Chevrolet Corvette, Ford Mustang, Dodge Challenger, Tesla Model S, BMW M3, Mercedes-AMG GT, Audi R8, Nissan GT-R, Toyota Supra, Honda NSX, Jaguar F-Type, Maserati MC20, Alfa Romeo Giulia, Lexus LC 500

### **Gym Equipment (20)**
Dumbbell, Barbell, Kettlebell, Bench Press, Squat Rack, Treadmill, Rowing Machine, Pull-up Bar, Medicine Ball, Resistance Bands, Battle Ropes, Weight Plates, Cable Machine, Leg Press, Smith Machine, Lat Pulldown, Elliptical, Exercise Bike, Foam Roller, Ab Wheel

---

## 🛡️ 2026 AI Compliance

### **SynthID Watermark**
- Automatic in Gemini 2.5 Flash Image
- Invisible to human eye
- Detectable by verification tools
- Survives video rendering

### **YouTube Requirements**
- Must select "Altered Content" label
- Disclosure: "AI-generated imagery"
- SynthID verification available

### **Metadata**
- All videos tagged with generation timestamp
- Model versions recorded
- Watermark flag in metadata

---

## 🚀 CLI Commands

```bash
# Basic generation
npm run generate generate

# Specific subject
npm run generate generate -- --category monuments --subject "Taj Mahal"

# Custom settings
npm run generate generate -- --duration 6 --clues 4

# Batch generation
npm run generate batch -- --file configs/batch-example.json

# List subjects
npm run generate list
npm run generate list -- --category cars

# System test
npm run generate test
```

---

This is a **complete, production-ready system** with intelligent AI integration, professional animations, and robust error handling!
