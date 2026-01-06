import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface ClueOverlayProps {
  text: string;
  index: number;
}

/**
 * Clue Overlay Component - Enhanced Sequential Design
 * Large, attention-grabbing clues with smooth animations
 * Designed to prevent overlap and maximize readability
 */
export const ClueOverlay: React.FC<ClueOverlayProps> = ({ text, index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dramatic slide-up entrance
  const slideUp = interpolate(frame, [0, 20], [200, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Pop-in scale animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 180,
    },
  });

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Pulse effect for speaking indicator
  const pulse = Math.sin(frame / 8) * 0.1 + 0.9;

  // Clue colors - vibrant and distinct
  const colors = [
    { primary: '#10b981', shadow: 'rgba(16, 185, 129, 0.5)' }, // Emerald
    { primary: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.5)' }, // Amber
    { primary: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' }, // Red
    { primary: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' }, // Blue
    { primary: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.5)' }, // Purple
  ];

  const clueColor = colors[(index - 1) % colors.length];

  // Progress dots
  const showProgressDots = frame > 10;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        pointerEvents: 'none',
        paddingBottom: 40,
      }}
    >
      {/* Audio speaking indicator - pulsing waves */}
      <div
        style={{
          position: 'absolute',
          bottom: 280,
          left: '50%',
          transform: `translateX(-50%) scale(${pulse})`,
          opacity: opacity * 0.6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 60 + i * 40,
              height: 20 + i * 10,
              border: `2px solid ${clueColor.primary}`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.3 - i * 0.1,
            }}
          />
        ))}
        <div
          style={{
            fontSize: 36,
            textAlign: 'center',
          }}
        >
          🔊
        </div>
      </div>

      {/* Main Clue Card - Large and centered */}
      <div
        style={{
          opacity,
          transform: `translateY(${slideUp}px) scale(${scale})`,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '50px 80px',
          borderRadius: 30,
          border: `5px solid ${clueColor.primary}`,
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.8),
            0 0 40px ${clueColor.shadow},
            inset 0 0 30px rgba(255,255,255,0.05)
          `,
          maxWidth: '85%',
          minWidth: '70%',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Glowing corner accents */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isTop = corner.includes('top');
          const isLeft = corner.includes('left');
          return (
            <div
              key={corner}
              style={{
                position: 'absolute',
                [isTop ? 'top' : 'bottom']: -8,
                [isLeft ? 'left' : 'right']: -8,
                width: 30,
                height: 30,
                background: clueColor.primary,
                borderRadius: '50%',
                boxShadow: `0 0 20px ${clueColor.shadow}`,
              }}
            />
          );
        })}

        {/* Clue Label with emphasis */}
        <div
          style={{
            fontSize: 42,
            color: clueColor.primary,
            fontWeight: 900,
            marginBottom: 25,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            textAlign: 'center',
            textShadow: `0 0 20px ${clueColor.shadow}, 0 4px 10px rgba(0,0,0,0.5)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <span style={{ fontSize: 48 }}>💡</span>
          <span>CLUE {index}</span>
          <span style={{ fontSize: 48 }}>💡</span>
        </div>

        {/* Divider line */}
        <div
          style={{
            width: '100%',
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${clueColor.primary} 50%, transparent 100%)`,
            marginBottom: 25,
            boxShadow: `0 0 10px ${clueColor.shadow}`,
          }}
        />

        {/* Clue Text - Large and readable */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.5,
            textShadow: `
              0 4px 12px rgba(0, 0, 0, 0.8),
              0 0 30px ${clueColor.shadow}
            `,
            padding: '10px 0',
          }}
        >
          {text}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: 5,
            background: clueColor.primary,
            borderRadius: 5,
            boxShadow: `0 0 20px ${clueColor.shadow}`,
          }}
        />
      </div>

      {/* Progress dots indicator */}
      {showProgressDots && (
        <div
          style={{
            marginTop: 30,
            display: 'flex',
            gap: 15,
            opacity: fadeIn,
          }}
        >
          {[1, 2, 3, 4, 5].map((dotIndex) => (
            <div
              key={dotIndex}
              style={{
                width: dotIndex === index ? 20 : 12,
                height: dotIndex === index ? 20 : 12,
                borderRadius: '50%',
                background: dotIndex === index ? clueColor.primary : 'rgba(255,255,255,0.3)',
                border: dotIndex === index ? `3px solid ${clueColor.primary}` : '2px solid rgba(255,255,255,0.5)',
                boxShadow: dotIndex === index ? `0 0 20px ${clueColor.shadow}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Animated hint text */}
      {frame > 25 && (
        <p
          style={{
            marginTop: 20,
            fontSize: 28,
            color: 'rgba(255,255,255,0.6)',
            fontStyle: 'italic',
            opacity: interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' }),
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          Listen carefully...
        </p>
      )}
    </AbsoluteFill>
  );
};
