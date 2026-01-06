import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, Img, staticFile, interpolate } from 'remotion';

interface RevealSlideProps {
  subject: string;
  imagePath: string;
}

/**
 * Reveal Slide Component - Full Screen Dramatic Reveal
 * Maximum impact with full-screen image and explosive animations
 */
export const RevealSlide: React.FC<RevealSlideProps> = ({ subject, imagePath }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dramatic entrance fade and zoom
  const entranceFade = interpolate(
    frame,
    [0, 25],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Image zoom-in explosion effect
  const imageScale = interpolate(
    frame,
    [0, 30],
    [0.7, 1],
    { extrapolateRight: 'clamp' }
  );

  // Exit fade
  const exitFade = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const slideOpacity = Math.min(entranceFade, exitFade);

  // Flash effect at reveal moment
  const flashOpacity = interpolate(
    frame,
    [0, 3, 8],
    [0, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Text pop animation
  const textScale = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 10,
      stiffness: 150,
      mass: 0.8,
    },
  });

  // Text slide up
  const textSlideUp = interpolate(
    frame,
    [10, 35],
    [100, 0],
    { extrapolateRight: 'clamp' }
  );

  // Confetti burst
  const confettiSpread = interpolate(frame, [5, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Fireworks particles
  const fireworksScale = interpolate(frame, [8, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Camera shake effect
  const shakeIntensity = interpolate(frame, [0, 10, 20], [0, 8, 0], {
    extrapolateRight: 'clamp',
  });
  const shakeX = Math.sin(frame * 2) * shakeIntensity;
  const shakeY = Math.cos(frame * 2.5) * shakeIntensity;

  // Pulse glow effect
  const glowPulse = Math.sin(frame / 10) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0a0a0a 100%)',
        opacity: slideOpacity,
        overflow: 'hidden',
      }}
    >
      {/* White flash overlay at reveal */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, #ffffff 0%, #ffd700 50%, transparent 100%)',
          opacity: flashOpacity,
          zIndex: 10,
        }}
      />

      {/* Full-screen image with dramatic zoom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <Img
          src={staticFile(imagePath)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${imageScale})`,
            filter: `brightness(1.1) contrast(1.1) saturate(1.2)`,
          }}
        />

        {/* Gradient overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Explosive confetti burst */}
      {[...Array(50)].map((_, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const distance = confettiSpread * (300 + (i % 5) * 100);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - (confettiSpread * 100);
        const rotation = frame * (3 + i % 5);
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da'];
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '40%',
              width: 15,
              height: 15,
              backgroundColor: colors[i % colors.length],
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '2px',
              opacity: entranceFade * (1 - confettiSpread * 0.5),
              boxShadow: `0 0 10px ${colors[i % colors.length]}`,
              zIndex: 5,
            }}
          />
        );
      })}

      {/* Fireworks burst from corners */}
      {[[10, 10], [90, 10], [10, 90], [90, 90]].map((pos, cornerIdx) => (
        <div key={cornerIdx} style={{ position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%` }}>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = fireworksScale * 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ffd700',
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: fireworksScale * (1 - fireworksScale * 0.7),
                  boxShadow: '0 0 15px #ffd700',
                  zIndex: 4,
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Answer announcement - top cinema bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
          padding: '40px 60px',
          zIndex: 6,
          opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <div
          style={{
            textAlign: 'center',
            transform: `translateY(${textSlideUp}px) scale(${textScale})`,
          }}
        >
          {/* Achievement badge */}
          <div
            style={{
              fontSize: 80,
              marginBottom: 20,
              filter: `drop-shadow(0 0 20px rgba(16, 185, 129, ${glowPulse}))`,
            }}
          >
            🎯
          </div>

          {/* "The Answer Is" label */}
          <div
            style={{
              fontSize: 38,
              color: '#10b981',
              fontWeight: 900,
              marginBottom: 20,
              textTransform: 'uppercase',
              letterSpacing: 8,
              textShadow: `
                0 0 20px rgba(16, 185, 129, 0.8),
                0 4px 12px rgba(0, 0, 0, 0.8)
              `,
              animation: 'glow 2s ease-in-out infinite',
            }}
          >
            ✓ THE ANSWER IS ✓
          </div>

          {/* Answer text with glow */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: 4,
              textShadow: `
                0 0 40px rgba(255, 215, 0, ${glowPulse}),
                0 0 20px rgba(255, 255, 255, 0.8),
                0 6px 20px rgba(0, 0, 0, 0.9),
                0 3px 5px rgba(0, 0, 0, 1)
              `,
              padding: '20px 40px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(16,185,129,0.1) 100%)',
              borderRadius: 20,
              border: '4px solid #ffd700',
              boxShadow: `
                0 0 40px rgba(255, 215, 0, 0.6),
                inset 0 0 30px rgba(255, 215, 0, 0.1)
              `,
            }}
          >
            {subject}
          </div>

          {/* Animated underline */}
          <div
            style={{
              marginTop: 25,
              height: 6,
              background: 'linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%)',
              borderRadius: 3,
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
              width: `${interpolate(frame, [25, 45], [0, 100], { extrapolateRight: 'clamp' })}%`,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </div>
      </div>

      {/* Celebration message at bottom */}
      {frame > 40 && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 6,
            opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div style={{ fontSize: 100, marginBottom: 20 }}>🎉</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#ffd700',
              textShadow: '0 0 30px rgba(255,215,0,0.8), 0 4px 15px rgba(0,0,0,0.9)',
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            Revealed!
          </div>
        </div>
      )}

      {/* Corner star bursts */}
      {frame > 10 && ['⭐', '✨', '💫', '🌟'].map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            [i % 2 === 0 ? 'left' : 'right']: '5%',
            [i < 2 ? 'top' : 'bottom']: '20%',
            fontSize: 60,
            opacity: Math.sin((frame - 10 + i * 10) / 15) * 0.5 + 0.5,
            transform: `rotate(${frame * (i % 2 === 0 ? 2 : -2)}deg) scale(${1 + Math.sin(frame / 10) * 0.2})`,
            filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))',
            zIndex: 7,
          }}
        >
          {star}
        </div>
      ))}

      {/* Radial light rays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `conic-gradient(
            from ${frame * 2}deg,
            transparent 0deg,
            rgba(255, 215, 0, 0.1) 45deg,
            transparent 90deg,
            rgba(255, 215, 0, 0.1) 135deg,
            transparent 180deg,
            rgba(255, 215, 0, 0.1) 225deg,
            transparent 270deg,
            rgba(255, 215, 0, 0.1) 315deg,
            transparent 360deg
          )`,
          opacity: entranceFade * 0.4,
          zIndex: 2,
        }}
      />
    </AbsoluteFill>
  );
};
