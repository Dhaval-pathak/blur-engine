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
 * Blur Slide Component - Spotlight Focus Design
 * Uses centered frame approach to guide viewer attention
 * Progressive de-pixelation with dramatic reveal
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
  const minScale = startResolution / endWidth;
  const scale = minScale + (1 - minScale) * progress;

  // Calculate blur amount in pixels (starts high, goes to 0)
  const maxBlur = 50;
  const blurAmount = maxBlur * (1 - progress);

  // Fade in effect
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Spotlight size - starts smaller, expands slightly
  const spotlightScale = interpolate(frame, [0, totalFrames], [0.85, 0.95], {
    extrapolateRight: 'clamp',
  });

  // Frame dimensions - responsive spotlight area
  const frameWidth = endWidth * 0.75; // 75% of screen width
  const frameHeight = endHeight * 0.60; // 60% of screen height

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1e 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeIn,
      }}
    >
      {/* Dark atmospheric vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Scanning lines effect */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: 'rgba(255,215,0,0.3)',
            top: `${((frame * 3 + i * 25) % 100)}%`,
            opacity: 0.4,
            boxShadow: '0 0 10px rgba(255,215,0,0.5)',
            zIndex: 2,
          }}
        />
      ))}

      {/* Main spotlight frame container */}
      <div
        style={{
          position: 'relative',
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${spotlightScale})`,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Glowing border frame */}
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #ffd700, #ff6b6b, #4ecdc4, #ffd700)',
            padding: 4,
            opacity: 0.6,
            boxShadow: '0 0 40px rgba(255,215,0,0.4), inset 0 0 40px rgba(255,215,0,0.2)',
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#000',
              borderRadius: 16,
            }}
          />
        </div>

        {/* Image container with blur effect */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderRadius: 16,
            zIndex: 4,
          }}
        >
          <Img
            src={staticFile(imagePath)}
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              imageRendering: scale < 0.5 ? 'pixelated' : 'auto',
              filter: `blur(${blurAmount}px) brightness(0.9)`,
              transform: `scale(${1 / scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Corner accents for frame */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isTop = corner.includes('top');
          const isLeft = corner.includes('left');
          return (
            <div
              key={corner}
              style={{
                position: 'absolute',
                [isTop ? 'top' : 'bottom']: -15,
                [isLeft ? 'left' : 'right']: -15,
                width: 50,
                height: 50,
                borderTop: isTop ? '4px solid #ffd700' : 'none',
                borderBottom: !isTop ? '4px solid #ffd700' : 'none',
                borderLeft: isLeft ? '4px solid #ffd700' : 'none',
                borderRight: !isLeft ? '4px solid #ffd700' : 'none',
                borderRadius: 8,
                boxShadow: `0 0 15px rgba(255,215,0,0.6)`,
                zIndex: 5,
              }}
            />
          );
        })}

        {/* Progress ring indicator */}
        <svg
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 100,
            height: 100,
            transform: 'rotate(-90deg)',
            zIndex: 5,
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="rgba(255,215,0,0.2)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#ffd700"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
            }}
          />
        </svg>

        {/* Percentage text */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffd700',
            textShadow: '0 0 10px rgba(255,215,0,0.8)',
            zIndex: 6,
          }}
        >
          {Math.round(progress * 100)}%
        </div>
      </div>

      {/* Bottom UI safe zone for clues */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 250,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* Side scanning effect */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: 'linear-gradient(to bottom, transparent 0%, #4ecdc4 50%, transparent 100%)',
          opacity: Math.sin(frame / 10) * 0.5 + 0.5,
          boxShadow: '0 0 20px #4ecdc4',
          transform: `translateX(${(frame * 5) % endWidth}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
