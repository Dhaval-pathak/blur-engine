import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import { IntroSlide } from './IntroSlide';
import { BlurSlide } from './BlurSlide';
import { RevealSlide } from './RevealSlide';
import { ClueOverlay } from './ClueOverlay';

interface Clue {
  text: string;
  timing: number;
  audioFile: string;
  audioDuration: number;
}

interface BlurRevealVideoProps {
  subject: string;
  category: string;
  imagePath: string;
  clues: Clue[];
  audio: {
    intro: {
      file: string;
      duration: number;
    };
    reveal: {
      file: string;
      duration: number;
    };
  };
  blur: {
    startResolution: number;
    progression: string;
  };
  timing: {
    introFrames: number;
    blurFrames: number;
    revealFrames: number;
    totalFrames: number;
  };
  config: {
    fps: number;
    width: number;
    height: number;
    duration: number;
  };
}

/**
 * Main Blur Reveal Video Composition - Enhanced with Proper Audio Queue Management
 * Orchestrates intro → blur reveal → final reveal
 * Ensures no audio overlap with proper timing buffers
 */
export const BlurRevealVideo: React.FC<BlurRevealVideoProps> = ({
  subject,
  category,
  imagePath,
  clues,
  audio,
  blur,
  timing,
  config,
}) => {
  const { introFrames, blurFrames, revealFrames } = timing;
  const { fps } = config;

  let currentFrame = 0;

  // Intro sequence
  const introStart = currentFrame;
  currentFrame += introFrames;

  // Blur reveal sequence start
  const blurStart = currentFrame;

  // Calculate clue timings with proper buffers to prevent overlap
  const BUFFER_FRAMES = Math.round(fps * 0.75); // 0.75 second buffer between clues
  
  const clueSequences = [];
  let previousEndTime = blurStart;
  
  for (let index = 0; index < clues.length; index++) {
    const clue = clues[index];
    const baseStartTime = blurStart + Math.round(clue.timing * fps);
    const duration = Math.ceil(clue.audioDuration * fps);
    
    // If this is not the first clue, ensure it starts after previous clue + buffer
    const startTime = index === 0 
      ? baseStartTime 
      : Math.max(baseStartTime, previousEndTime + BUFFER_FRAMES);
    
    const endTime = startTime + duration;
    
    clueSequences.push({
      ...clue,
      startTime,
      duration,
      endTime,
    });
    
    previousEndTime = endTime;
  }

  // Calculate when blur section actually ends (after last clue finishes)
  const lastClueEndTime = clueSequences.length > 0 
    ? clueSequences[clueSequences.length - 1].endTime 
    : blurStart;
  
  // Add a dramatic pause before reveal (2 seconds)
  const REVEAL_PAUSE_FRAMES = fps * 2;
  const actualBlurDuration = Math.max(
    blurFrames,
    lastClueEndTime - blurStart + REVEAL_PAUSE_FRAMES
  );

  // Final reveal starts after blur section completes
  const revealStart = blurStart + actualBlurDuration;

  return (
    <AbsoluteFill style={{ background: '#000000' }}>
      {/* Intro Slide */}
      <Sequence from={introStart} durationInFrames={introFrames}>
        <IntroSlide category={category} />
      </Sequence>

      {/* Intro Audio */}
      {audio.intro.file && (
        <Sequence from={introStart}>
          <Audio src={staticFile(audio.intro.file)} volume={0.8} />
        </Sequence>
      )}

      {/* Blur Reveal Slide - Extended duration to accommodate all clues */}
      <Sequence from={blurStart} durationInFrames={actualBlurDuration}>
        <BlurSlide
          imagePath={imagePath}
          startResolution={blur.startResolution}
          endWidth={config.width}
          endHeight={config.height}
          totalFrames={actualBlurDuration}
          progression={blur.progression}
        />
      </Sequence>

      {/* Clue Overlays - Sequential with proper timing to prevent overlap */}
      {clueSequences.map((clueSeq, index) => {
        return (
          <React.Fragment key={index}>
            {/* Clue Text Overlay - shows during audio playback */}
            <Sequence from={clueSeq.startTime} durationInFrames={clueSeq.duration}>
              <ClueOverlay text={clueSeq.text} index={index + 1} />
            </Sequence>

            {/* Clue Audio */}
            {clueSeq.audioFile && (
              <Sequence from={clueSeq.startTime}>
                <Audio src={staticFile(clueSeq.audioFile)} volume={0.9} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}

      {/* Suspense Pause Overlay - "Final chance to guess..." */}
      {clueSequences.length > 0 && (
        <Sequence 
          from={lastClueEndTime} 
          durationInFrames={REVEAL_PAUSE_FRAMES}
        >
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
                padding: '40px 80px',
                borderRadius: 30,
                border: '4px solid #ff6b6b',
                boxShadow: '0 0 40px rgba(255,107,107,0.6), 0 20px 60px rgba(0,0,0,0.8)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 20 }}>⏰</div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: '#ff6b6b',
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                  textShadow: '0 0 20px rgba(255,107,107,0.8)',
                }}
              >
                Final Chance to Guess...
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Final Reveal Slide */}
      <Sequence from={revealStart} durationInFrames={revealFrames}>
        <RevealSlide subject={subject} imagePath={imagePath} />
      </Sequence>

      {/* Reveal Audio */}
      {audio.reveal.file && (
        <Sequence from={revealStart}>
          <Audio src={staticFile(audio.reveal.file)} volume={0.9} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
