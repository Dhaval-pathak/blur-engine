import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';

interface ClueOverlayProps {
  text: string;
  index: number;
}

/**
 * Clue Overlay Component
 * Displays clue text over the blur reveal
 */
export const ClueOverlay: React.FC<ClueOverlayProps> = ({ text, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop-in animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  // Fade in/out
  const fadeIn = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  // Clue colors
  const colors = [
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
  ];

  const clueColor = colors[(index - 1) % colors.length];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        pointerEvents: 'none',
        paddingBottom: 120,
      }}
    >
      {/* Clue Card */}
      <div
        style={{
          opacity: fadeIn,
          transform: `scale(${scale})`,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '25px 50px',
          borderRadius: 25,
          border: `3px solid ${clueColor}`,
          boxShadow: `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${clueColor}40`,
          maxWidth: '80%',
        }}
      >
        {/* Clue Label */}
        <div
          style={{
            fontSize: 28,
            color: clueColor,
            fontWeight: 'bold',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          💡 Clue {index}
        </div>

        {/* Clue Text */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.4,
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
