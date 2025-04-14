'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';

// Generate a random position within a sphere
function randomPointInSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random()) * radius;
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  return {
    x: r * sinPhi * cosTheta,
    y: r * sinPhi * sinTheta,
    z: r * cosPhi,
  };
}

function ParticleSystem() {
  const pointsRef = useRef();
  const particleCount = 200;

  // Create particles with positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const { x, y, z } = randomPointInSphere(5);
      temp.push({ x, y, z, size: Math.random() * 0.05 + 0.01 });
    }
    return temp;
  }, []);

  // Set up positions and sizes for all particles
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    particles.forEach((particle, i) => {
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
      sizes[i] = particle.size;
    });

    return { positions, sizes };
  }, [particles]);

  // Spring animation for the entire particle system
  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    config: { mass: 3, tension: 100, friction: 25 },
  }));

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      api.start({
        rotation: [y * 0.2, x * 0.2, 0],
        position: [x * 0.5, y * 0.5, 0],
      });
    };

    const throttledMouseMove = throttle(handleMouseMove, 50);
    window.addEventListener('mousemove', throttledMouseMove);
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [api]);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current) return;

    // Subtle continuous rotation
    pointsRef.current.rotation.y += 0.0005;

    // Update particle positions for a flowing effect
    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime() * 0.2;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Apply a subtle sine wave motion to each particle
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Calculate distance from origin
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = Math.min(distance / 5, 1);

      // Calculate oscillation based on distance and time
      const oscillation = Math.sin(distance * 0.5 + time) * 0.03 * normalizedDistance;

      // Apply oscillation to the particle's radial position
      const scale = 1 + oscillation;
      positions[i3] = particles[i].x * scale;
      positions[i3 + 1] = particles[i].y * scale;
      positions[i3 + 2] = particles[i].z * scale;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <animated.group position={spring.position} rotation={spring.rotation}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.positions.length / 3}
            array={positions.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={positions.sizes.length}
            array={positions.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation={true}
          color="#8ab4f8"
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </points>
    </animated.group>
  );
}

// Utility function for throttling events
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export default function ThreeBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-50 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]} // Optimize for performance
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <ParticleSystem />
      </Canvas>
    </div>
  );
}
