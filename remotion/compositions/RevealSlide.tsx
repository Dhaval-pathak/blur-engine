import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, Img, staticFile, interpolate } from 'remotion';

interface RevealSlideProps {
  subject: string;
  imagePath: string;
}

/**
 * Reveal Slide Component
 * Final reveal with answer and celebration
 */
export const RevealSlide: React.FC<RevealSlideProps> = ({ subject, imagePath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in
  const entranceFade = interpolate(
    frame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Fade out
  const exitFade = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const slideOpacity = Math.min(entranceFade, exitFade);

  // Pop animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  // Confetti animation
  const confettiY = interpolate(frame, [0, 30], [-100, 600], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        opacity: slideOpacity,
      }}
    >
      {/* Confetti Effect */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 7 + 5)}%`,
            top: confettiY + (i * 25) % 100,
            width: 20,
            height: 20,
            backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#10b981' : '#ef4444',
            transform: `rotate(${i * 30}deg)`,
            borderRadius: i % 2 === 0 ? '50%' : 0,
            opacity: entranceFade * 0.8,
          }}
        />
      ))}

      {/* Clear Image */}
      <div
        style={{
          width: '90%',
          height: '70%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <Img
          src={staticFile(imagePath)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            transform: `scale(${scale})`,
          }}
        />
      </div>

      {/* Answer Label */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: '50%',
          transform: `translateX(-50%) scale(${scale})`,
          textAlign: 'center',
          maxWidth: '90%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '30px 60px',
          borderRadius: 25,
          border: '4px solid #10b981',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: '#10b981',
            fontWeight: 'bold',
            marginBottom: 15,
            textTransform: 'uppercase',
            letterSpacing: 4,
          }}
        >
          ✓ The Answer Is
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {subject}
        </div>
      </div>

      {/* Celebration Emoji */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          fontSize: 80,
          opacity: entranceFade,
        }}
      >
        🎉
      </div>
    </AbsoluteFill>
  );
};
