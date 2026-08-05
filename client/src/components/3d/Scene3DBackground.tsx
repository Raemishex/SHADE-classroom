import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';

export function Scene3DBackground() {
  const { tier, reducedMotion } = useDeviceCapability();

  // If low tier or reduced motion, skip 3D canvas for performance & accessibility
  if (tier === 'low' || reducedMotion) {
    return null;
  }

  const particleCount = tier === 'high' ? 300 : 150;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <ParticleField count={particleCount} />
      </Canvas>
    </div>
  );
}
