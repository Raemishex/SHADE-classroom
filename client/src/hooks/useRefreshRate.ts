import { useState, useEffect } from 'react';

export function useRefreshRate(): number {
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    let frameCount = 0;
    let startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      frameCount++;
      const elapsed = now - startTime;

      if (elapsed >= 1000) {
        const calculatedFps = Math.round((frameCount * 1000) / elapsed);
        // Normalize to common rates (60, 90, 120, 144)
        if (calculatedFps > 130) setFps(144);
        else if (calculatedFps > 105) setFps(120);
        else if (calculatedFps > 75) setFps(90);
        else setFps(60);

        frameCount = 0;
        startTime = now;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return fps;
}
