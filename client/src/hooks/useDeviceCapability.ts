import { useState, useEffect } from 'react';

export type DeviceTier = 'high' | 'medium' | 'low';

export interface DeviceCapability {
  tier: DeviceTier;
  isTouch: boolean;
  reducedMotion: boolean;
  pixelRatio: number;
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>({
    tier: 'high',
    isTouch: false,
    reducedMotion: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  });

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    const dpr = window.devicePixelRatio || 1;

    let tier: DeviceTier = 'high';
    if (reducedMotion || cores <= 2 || memory <= 2) {
      tier = 'low';
    } else if (cores <= 4 || memory <= 4) {
      tier = 'medium';
    }

    setCapability({
      tier,
      isTouch,
      reducedMotion,
      pixelRatio: Math.min(dpr, 2),
    });
  }, []);

  return capability;
}
