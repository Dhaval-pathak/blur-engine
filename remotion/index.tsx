import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BlurRevealVideo } from './compositions/BlurRevealVideo';

/**
 * Remotion Root Configuration
 */

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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BlurRevealVideo"
        component={BlurRevealVideo as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          subject: 'Taj Mahal',
          category: 'monuments',
          imagePath: '',
          clues: [],
          audio: {
            intro: { file: '', duration: 3 },
            reveal: { file: '', duration: 3 },
          },
          blur: {
            startResolution: 10,
            progression: 'exponential',
          },
          timing: {
            introFrames: 90,
            blurFrames: 150,
            revealFrames: 90,
            totalFrames: 330,
          },
          config: {
            fps: 30,
            width: 1080,
            height: 1920,
            duration: 5,
          },
        }}
        calculateMetadata={({ props }) => {
          const p = props as unknown as BlurRevealVideoProps;
          return {
            durationInFrames: p.timing?.totalFrames || 300,
            fps: p.config?.fps || 30,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
