import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootLoaderProps {
  onComplete: () => void;
}

export default function BootLoader({ onComplete }: BootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Animate to 100% over ~1.3s, then trigger complete
    const start = performance.now();
    const duration = 1300;

    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - raw, 3);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        setDone(true);
        setTimeout(onComplete, 420);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="boot-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
        >
          <motion.div
            className="boot-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Logo */}
            <div className="boot-logo">
              <div className="boot-logo-icon">
                <svg viewBox="0 0 40 40" width="42" height="42" fill="none">
                  <polygon
                    points="20,2 37,11 37,29 20,38 3,29 3,11"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <polygon
                    points="20,8 31,14 31,26 20,32 9,26 9,14"
                    stroke="#2563eb"
                    strokeWidth="0.8"
                    strokeDasharray="3 2"
                    opacity="0.35"
                    fill="none"
                  />
                  <circle cx="20" cy="20" r="4.5" fill="#2563eb" />
                </svg>
              </div>
              <div className="boot-logo-wordmark">TINKERTHIX</div>
            </div>

            {/* Message */}
            <p className="boot-message">
              Initializing TinkerThix Research Portal...
            </p>

            {/* Progress bar */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="boot-bar-track">
                <motion.div
                  className="boot-bar-fill"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.05 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span className="boot-pct">{progress}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
