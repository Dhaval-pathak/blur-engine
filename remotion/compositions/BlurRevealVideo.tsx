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
 * Main Blur Reveal Video Composition
 * Orchestrates intro → blur reveal → final reveal
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

  // Blur reveal sequence
  const blurStart = currentFrame;
  currentFrame += blurFrames;

  // Final reveal sequence
  const revealStart = currentFrame;

  return (
    <AbsoluteFill style={{ background: '#000000' }}>
      {/* Intro Slide */}
      <Sequence from={introStart} durationInFrames={introFrames}>
        <IntroSlide category={category} />
      </Sequence>

      {/* Intro Audio */}
      {audio.intro.file && (
        <Sequence from={introStart}>
          <Audio src={staticFile(audio.intro.file)} />
        </Sequence>
      )}

      {/* Blur Reveal Slide */}
      <Sequence from={blurStart} durationInFrames={blurFrames}>
        <BlurSlide
          imagePath={imagePath}
          startResolution={blur.startResolution}
          endWidth={config.width}
          endHeight={config.height}
          totalFrames={blurFrames}
          progression={blur.progression}
        />
      </Sequence>

      {/* Clue Overlays */}
      {clues.map((clue, index) => {
        const clueFrame = blurStart + Math.round(clue.timing * fps);
        const clueDuration = Math.ceil(clue.audioDuration * fps);

        return (
          <React.Fragment key={index}>
            {/* Clue Text Overlay */}
            <Sequence from={clueFrame} durationInFrames={clueDuration}>
              <ClueOverlay text={clue.text} index={index + 1} />
            </Sequence>

            {/* Clue Audio */}
            {clue.audioFile && (
              <Sequence from={clueFrame}>
                <Audio src={staticFile(clue.audioFile)} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}

      {/* Final Reveal Slide */}
      <Sequence from={revealStart} durationInFrames={revealFrames}>
        <RevealSlide subject={subject} imagePath={imagePath} />
      </Sequence>

      {/* Reveal Audio */}
      {audio.reveal.file && (
        <Sequence from={revealStart}>
          <Audio src={staticFile(audio.reveal.file)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
