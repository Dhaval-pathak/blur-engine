import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface IntroSlideProps {
  category: string;
}

/**
 * Intro Slide Component
 * Shows "Can you guess..." message
 */
export const IntroSlide: React.FC<IntroSlideProps> = ({ category }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animations
  const fadeIn = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const overallOpacity = Math.min(fadeIn, fadeOut);

  const scaleIn = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 80,
      mass: 0.5,
    },
  });

  // Category display text
  const categoryTexts: Record<string, string> = {
    monuments: 'Iconic Monument',
    cars: 'Legendary Car',
    gym: 'Gym Equipment',
    animals: 'Animal',
    food: 'Delicious Dish',
  };

  const categoryText = categoryTexts[category] || 'Mystery Subject';

  // Gradient background
  const gradientOffset = interpolate(frame, [0, 120], [0, 360], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientOffset}deg, #667eea 0%, #764ba2 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        opacity: overallOpacity,
      }}
    >
      {/* Animated circles background */}
      <div
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          opacity: 0.1,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              borderRadius: '50%',
              border: '3px solid white',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) scale(${interpolate(
                frame,
                [0, 60],
                [0, 1 + i * 0.1],
                { extrapolateRight: 'clamp' }
              )})`,
              opacity: fadeIn * (1 - i * 0.15),
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          opacity: fadeIn,
          transform: `scale(${scaleIn})`,
          textAlign: 'center',
          padding: 60,
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 40,
          }}
        >
          🤔
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            marginBottom: 30,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Can You Guess?
        </h1>

        {/* Category Badge */}
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '20px 50px',
            borderRadius: 20,
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <p
            style={{
              fontSize: 48,
              color: 'white',
              margin: 0,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {categoryText}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
