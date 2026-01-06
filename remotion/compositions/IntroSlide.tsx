import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface IntroSlideProps {
  category: string;
}

/**
 * Intro Slide Component - Cinematic Dark Theme
 * Creates suspense and anticipation with dramatic visuals
 */
export const IntroSlide: React.FC<IntroSlideProps> = ({ category }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Smooth fade in/out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const overallOpacity = Math.min(fadeIn, fadeOut);

  // Category display text
  const categoryTexts: Record<string, string> = {
    monuments: 'ICONIC MONUMENT',
    cars: 'LEGENDARY CAR',
    gym: 'GYM EQUIPMENT',
    animals: 'ANIMAL',
    food: 'DELICIOUS DISH',
  };

  const categoryText = categoryTexts[category] || 'MYSTERY SUBJECT';

  // Searchlight animation - scanning effect
  const searchlightAngle = interpolate(frame, [0, 90], [-45, 45], {
    extrapolateRight: 'clamp',
  });

  // Particle convergence
  const particleProgress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Letter-by-letter reveal timing
  const titleText = 'Can You Guess?';
  const lettersToShow = Math.floor(interpolate(frame, [20, 50], [0, titleText.length], {
    extrapolateRight: 'clamp',
  }));

  // Countdown timer
  const countdownStart = 60;
  const countdownValue = Math.max(0, 3 - Math.floor((frame - countdownStart) / (fps / 3)));
  const showCountdown = frame >= countdownStart && countdownValue > 0;

  // Pulse effect for urgency
  const pulse = Math.sin(frame / 10) * 0.1 + 1;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Arial Black', Arial, sans-serif",
        opacity: overallOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Cinematic letterbox bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: '#000', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: '#000', zIndex: 2 }} />

      {/* Animated searchlight beams */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          opacity: 0.15,
          transform: `rotate(${searchlightAngle}deg)`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${i * 33}%`,
              top: '-50%',
              width: 120,
              height: '200%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.3) 50%, transparent 100%)',
              transform: `skewY(${20 + i * 10}deg)`,
            }}
          />
        ))}
      </div>

      {/* Particle convergence effect */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: fadeIn * 0.6 }}>
        {[...Array(30)].map((_, i) => {
          const angle = (i / 30) * Math.PI * 2;
          const startDist = 800;
          const endDist = 0;
          const distance = startDist - (startDist - endDist) * particleProgress;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b6b' : '#4ecdc4',
                transform: `translate(${x}px, ${y}px)`,
                boxShadow: `0 0 10px ${i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b6b' : '#4ecdc4'}`,
                opacity: particleProgress,
              }}
            />
          );
        })}
      </div>

      {/* Main content container */}
      <div
        style={{
          textAlign: 'center',
          padding: 60,
          zIndex: 1,
          position: 'relative',
        }}
      >
        {/* Spotlight circle effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            opacity: fadeIn,
          }}
        />

        {/* Mystery icon with glow */}
        <div
          style={{
            fontSize: 140,
            marginBottom: 50,
            filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))',
            transform: `scale(${pulse})`,
          }}
        >
          🔍
        </div>

        {/* Main Title - Letter by letter animation */}
        <h1
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            marginBottom: 40,
            textShadow: '0 0 20px rgba(255,215,0,0.5), 0 4px 30px rgba(0,0,0,0.8)',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {titleText.split('').map((letter, i) => (
            <span
              key={i}
              style={{
                opacity: i < lettersToShow ? 1 : 0,
                display: 'inline-block',
                transform: i < lettersToShow ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.3s ease',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </h1>

        {/* Category badge with animated appearance */}
        <div
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,107,107,0.15) 100%)',
            backdropFilter: 'blur(10px)',
            padding: '25px 60px',
            borderRadius: 50,
            border: '3px solid rgba(255,215,0,0.5)',
            boxShadow: '0 0 30px rgba(255,215,0,0.3), inset 0 0 20px rgba(255,215,0,0.1)',
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `scale(${interpolate(frame, [40, 60], [0.8, 1], { extrapolateRight: 'clamp' })})`,
          }}
        >
          <p
            style={{
              fontSize: 52,
              color: '#ffd700',
              margin: 0,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 6,
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
            }}
          >
            {categoryText}
          </p>
        </div>

        {/* Countdown timer for urgency */}
        {showCountdown && (
          <div
            style={{
              marginTop: 50,
              fontSize: 120,
              fontWeight: 900,
              color: '#ff6b6b',
              textShadow: '0 0 40px rgba(255,107,107,0.8)',
              transform: `scale(${pulse})`,
              animation: 'pulse 0.5s ease-in-out infinite',
            }}
          >
            {countdownValue}
          </div>
        )}

        {/* Suspense text */}
        {frame > 70 && (
          <p
            style={{
              fontSize: 38,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 30,
              fontStyle: 'italic',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            Get ready to test your knowledge...
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%)',
          opacity: fadeIn,
          boxShadow: '0 0 20px rgba(255,215,0,0.5)',
        }}
      />
    </AbsoluteFill>
  );
};
