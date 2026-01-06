import React from 'react';
import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from 'remotion';

interface BlurSlideProps {
  imagePath: string;
  startResolution: number;
  endWidth: number;
  endHeight: number;
  totalFrames: number;
  progression: string;
}

/**
 * Blur Slide Component
 * Progressive de-pixelation effect
 * Uses CSS filter blur that reduces over time
 */
export const BlurSlide: React.FC<BlurSlideProps> = ({
  imagePath,
  startResolution,
  endWidth,
  endHeight,
  totalFrames,
  progression,
}) => {
  const frame = useCurrentFrame();

  // Calculate blur progress (0 = fully blurred, 1 = clear)
  let progress;
  if (progression === 'exponential') {
    // Exponential: slower reveal at start, faster at end
    progress = Math.pow(frame / totalFrames, 2);
  } else {
    // Linear: constant speed
    progress = frame / totalFrames;
  }

  // Calculate pixelation level
  // At start: very pixelated (low resolution scale)
  // At end: clear (scale = 1)
  const minScale = startResolution / endWidth; // e.g., 10/1080 = 0.00926
  const scale = minScale + (1 - minScale) * progress;

  // Calculate blur amount in pixels (starts high, goes to 0)
  const maxBlur = 50; // Maximum blur in pixels
  const blurAmount = maxBlur * (1 - progress);

  // Fade in effect
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeIn,
      }}
    >
      {/* Image with pixelation and blur effect */}
      <div
        style={{
          width: endWidth,
          height: endHeight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(imagePath)}
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            imageRendering: scale < 0.5 ? 'pixelated' : 'auto',
            filter: `blur(${blurAmount}px)`,
            transform: `scale(${1 / scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Vignette overlay for better visibility */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Progress indicator (optional, subtle) */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: 4,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.1s',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
