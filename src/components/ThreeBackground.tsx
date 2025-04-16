'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// Simple debounce function
function debounce(func: (...args: unknown[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Self-contained Three.js component that doesn't use react-three-fiber
export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Track if the component is mounted
    let isMounted = true;

    // Keep references to important objects for resize handling
    let activeRenderer: THREE.WebGLRenderer | null = null;
    let activeCamera: THREE.PerspectiveCamera | null = null;

    // Create scene, camera, renderer
    const setupScene = () => {
      // Clear any existing canvas
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      // Initialize the scene
      const scene = new THREE.Scene();

      // Determine if we're in dark or light mode
      const currentTheme = theme === 'dark' || resolvedTheme === 'dark' ? 'dark' : 'light';

      // Create a camera with greater field of view and frustum
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      camera.position.z = 15;

      // Save camera reference for resize handling
      activeCamera = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // Save renderer reference for resize handling
      activeRenderer = renderer;

      // Add to DOM
      containerRef.current?.appendChild(renderer.domElement);

      // Calculate scene boundaries based on camera properties
      const getBoundaries = () => {
        const fovRadians = THREE.MathUtils.degToRad(camera.fov);
        const depth = camera.position.z;
        const height = 2 * Math.tan(fovRadians / 2) * depth;
        const width = height * camera.aspect;

        // Add extra margin to ensure particles are never clipped
        return {
          width: width * 2,
          height: height * 2,
          depth: 30,
        };
      };

      const bounds = getBoundaries();

      // Create orbital centers that particles will orbit around
      const createOrbitalCenters = () => {
        // Create orbital centers
        const centers = [];

        // Add main orbital center at the middle
        centers.push({
          position: new THREE.Vector3(0, 0, 5), // Centered in camera view
          mass: 1.5, // Stronger mass for more defined orbit
          radius: 30, // Large radius to affect most particles
        });

        // Add second orbital center offset from the main one
        centers.push({
          position: new THREE.Vector3(8, -5, 7), // Offset position
          mass: 0.8, // Slightly weaker mass
          radius: 20, // Smaller radius of influence
        });

        return centers;
      };

      // Create orbital centers
      const orbitalCenters = createOrbitalCenters();

      // We'll keep orbital centers as invisible force points - no visible spheres

      // Create particles
      const particleCount = 2000;

      // Create geometry and buffers
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const opacityValues = new Float32Array(particleCount); // For individual fade-in control

      // Initialize particles with random positions and velocities
      const initializeParticles = () => {
        // Determine color palette based on theme
        const isDarkMode = currentTheme === 'dark';

        // Define orbit parameters
        const orbitRadius = 12; // Main orbit radius
        const orbitThickness = 8; // How thick the orbit stream is
        const orbitVariation = 4; // Vertical variation in orbit plane

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Distribute particles along a circular orbit with some variation
          // Generate a random angle around the circle
          const angle = Math.random() * Math.PI * 2;

          // Calculate base position on the circle
          const baseRadius = orbitRadius + (Math.random() * orbitThickness - orbitThickness / 2);
          const x = Math.cos(angle) * baseRadius;
          const y = Math.sin(angle) * baseRadius;

          // Add some vertical variation
          const z = (Math.random() - 0.5) * orbitVariation;

          // Set position
          positions[i3] = x;
          positions[i3 + 1] = y;
          positions[i3 + 2] = z;

          // Calculate orbital velocity (perpendicular to radius)
          const speed = 0.03 + Math.random() * 0.02;
          velocities[i3] = -Math.sin(angle) * speed; // Tangential direction
          velocities[i3 + 1] = Math.cos(angle) * speed; // Tangential direction
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.01; // Slight z variation

          // Randomize initial opacity for staggered fade-in
          opacityValues[i] = Math.random() * 0.1; // Start mostly transparent

          // Add some brighter particles to represent main stars
          const particleType = Math.random();

          if (isDarkMode) {
            // Dark mode colors - blues and purples
            if (particleType < 0.5) {
              // Blue range - regular particles
              const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.7, 0.7);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.05 + 0.02;
            } else if (particleType < 0.8) {
              // Purple range - regular particles
              const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.7, 0.7);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.05 + 0.02;
            } else if (particleType < 0.95) {
              // Cyan/white for stars
              const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.7, 0.9);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.08 + 0.04;
            } else {
              // Larger, brighter particles
              const hue = Math.random() * 0.2 + 0.6; // Blue to purple range
              const color = new THREE.Color().setHSL(hue, 0.9, 0.9);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.15 + 0.08; // Larger but not too large
            }
          } else {
            // Light mode colors - warmer tones: oranges, yellows, and light pinks
            if (particleType < 0.5) {
              // Orange range - regular particles
              const color = new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 0.7, 0.6);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.05 + 0.02;
            } else if (particleType < 0.8) {
              // Yellow/gold range - regular particles
              const color = new THREE.Color().setHSL(0.12 + Math.random() * 0.05, 0.8, 0.6);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.05 + 0.02;
            } else if (particleType < 0.95) {
              // Light pink/peach for stars
              const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.05, 0.7, 0.7);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.08 + 0.04;
            } else {
              // Larger, brighter particles
              const hue = Math.random() * 0.1 + 0.05; // Warm orange/yellow range
              const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
              colors[i3] = color.r;
              colors[i3 + 1] = color.g;
              colors[i3 + 2] = color.b;
              sizes[i] = Math.random() * 0.15 + 0.08; // Larger but not too large
            }
          }
        }
      };

      // Initialize particles
      initializeParticles();

      // Set attributes
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      particles.setAttribute('opacity', new THREE.BufferAttribute(opacityValues, 1));

      // Create material
      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 1.0, // We'll use per-particle opacity instead of global
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      // Create shader material for custom opacity per particle
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: null },
        },
        vertexShader: `
          attribute float opacity;
          varying float vOpacity;
          attribute float size;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vOpacity;
          
          void main() {
            // Simple circular particle shape
            float r = 0.5;
            vec2 center = vec2(0.5, 0.5);
            float distance = length(gl_PointCoord - center);
            float alpha = smoothstep(r, r - 0.05, distance) * vOpacity;
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true,
      });

      // Create particle system with shader material
      const particleSystem = new THREE.Points(particles, shaderMaterial);
      scene.add(particleSystem);

      // Animation loop
      const clock = new THREE.Clock();
      let animationId: number;

      // Fade-in animation variables
      const fadeInDuration = 10.0; // Slower fade-in over 10 seconds
      const targetOpacity = 0.7; // Final opacity value
      const startTime = clock.getElapsedTime();
      let isFadingIn = true;

      // Start with centers clustered, then gradually move them outward
      const centersExpanding = false; // We don't need expansion anymore since we start with one center

      // Second mass rotation parameters
      const secondMassRotationSpeed = 0.2; // Rotation speed in radians per second
      const secondMassDistance = 9.5; // Distance from primary mass (derived from the initial position)

      // Temp vectors for physics calculations (reused for performance)
      const tempVector = new THREE.Vector3();
      const tempVector2 = new THREE.Vector3();

      const animate = () => {
        if (!isMounted) return;

        const elapsedTime = clock.getElapsedTime();

        // Handle fade-in effect - gradually increase opacity of each particle individually
        if (isFadingIn) {
          const fadeTime = elapsedTime - startTime;
          const fadeProgress = Math.min(fadeTime / fadeInDuration, 1.0);

          // Update opacity values for each particle
          const opacityAttribute = particles.getAttribute('opacity') as THREE.BufferAttribute;
          const opacityArray = opacityAttribute.array as Float32Array;

          for (let i = 0; i < particleCount; i++) {
            // Each particle fades in at a slightly different rate
            const individualDelay = (i / particleCount) * 2.0; // Stagger over 2 seconds
            const individualProgress = Math.max(
              0,
              Math.min(
                1,
                (fadeProgress * fadeInDuration - individualDelay) /
                  (fadeInDuration - individualDelay * 0.5)
              )
            );

            // Use smooth easing function
            const easedProgress = 1 - Math.pow(1 - individualProgress, 3); // Cubic ease-out
            opacityArray[i] = easedProgress * targetOpacity;
          }

          opacityAttribute.needsUpdate = true;

          if (fadeProgress >= 1.0) {
            isFadingIn = false;
          }
        }

        // To keep the main orbital center mostly pinned at (0,0,z), we'll add a slight drift and correction
        if (!centersExpanding) {
          const mainCenter = orbitalCenters[0]; // The first center is our main orbital center

          // Add very slight drift to make it more natural
          mainCenter.position.x += (Math.random() - 0.5) * 0.01;
          mainCenter.position.y += (Math.random() - 0.5) * 0.01;

          // Then correct back to center with a gentle pull
          mainCenter.position.x *= 0.99;
          mainCenter.position.y *= 0.99;

          // Rotate the second mass around the primary mass
          const secondCenter = orbitalCenters[1]; // The second orbital center
          const angle = elapsedTime * secondMassRotationSpeed;

          secondCenter.position.x = Math.cos(angle) * secondMassDistance;
          secondCenter.position.y = Math.sin(angle) * secondMassDistance;
          secondCenter.position.z = 7 + Math.sin(elapsedTime * 0.5) * 2; // Add some z-axis oscillation
        }

        // Update camera based on mouse
        // Disable mouse-based camera movement
        // camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
        // camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Get current bounds
        const halfWidth = bounds.width / 2;
        const halfHeight = bounds.height / 2;
        const halfDepth = bounds.depth / 2;

        // Update particle positions based on their velocities and orbital forces
        const positionArray = particles.attributes.position.array as Float32Array;

        // Minimum distance from camera to prevent dots from getting too big
        const minCameraDistance = 8; // Increased from 5 to 8
        const earlyPushDistance = 10; // Start pushing gently before reaching minimum
        const cameraPos = new THREE.Vector3(
          camera.position.x,
          camera.position.y,
          camera.position.z
        );

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Get particle position
          const particlePos = tempVector.set(
            positionArray[i3],
            positionArray[i3 + 1],
            positionArray[i3 + 2]
          );

          // Check distance to camera and push away if getting close
          // Do this check early to prioritize it
          const distanceToCamera = cameraPos.distanceTo(particlePos);

          if (distanceToCamera < minCameraDistance) {
            // Get direction from camera to particle
            const pushDir = tempVector2.subVectors(particlePos, cameraPos).normalize();

            // Stronger push factor with exponential increase as distance decreases
            const pushFactor = (minCameraDistance - distanceToCamera) * 0.3;

            // Immediate strong push for particles too close (teleport them out a bit)
            if (distanceToCamera < minCameraDistance * 0.7) {
              const emergencyPush = minCameraDistance * 0.5;
              positionArray[i3] = cameraPos.x + pushDir.x * (minCameraDistance + emergencyPush);
              positionArray[i3 + 1] = cameraPos.y + pushDir.y * (minCameraDistance + emergencyPush);
              positionArray[i3 + 2] = cameraPos.z + pushDir.z * (minCameraDistance + emergencyPush);
            } else {
              // Normal push
              positionArray[i3] += pushDir.x * pushFactor;
              positionArray[i3 + 1] += pushDir.y * pushFactor;
              positionArray[i3 + 2] += pushDir.z * pushFactor;
            }

            // Strong velocity adjustment away from camera
            velocities[i3] = pushDir.x * 0.1;
            velocities[i3 + 1] = pushDir.y * 0.1;
            velocities[i3 + 2] = pushDir.z * 0.1;

            // Skip other forces for this particle this frame
            // This prioritizes the camera distance enforcement
            continue;
          } else if (distanceToCamera < earlyPushDistance) {
            // Early gentle push when approaching minimum distance
            const pushDir = tempVector2.subVectors(particlePos, cameraPos).normalize();
            const easyPushFactor = (earlyPushDistance - distanceToCamera) * 0.05;

            // Add gentle push
            positionArray[i3] += pushDir.x * easyPushFactor;
            positionArray[i3 + 1] += pushDir.y * easyPushFactor;
            positionArray[i3 + 2] += pushDir.z * easyPushFactor;

            // Slightly adjust velocity
            velocities[i3] += pushDir.x * easyPushFactor * 0.2;
            velocities[i3 + 1] += pushDir.y * easyPushFactor * 0.2;
            velocities[i3 + 2] += pushDir.z * easyPushFactor * 0.2;
          }

          // Apply orbital forces from all centers
          for (const center of orbitalCenters) {
            // Get vector from particle to center
            const toCenter = tempVector2.subVectors(center.position, particlePos);
            const distance = toCenter.length();

            // Only apply orbital force if within center's radius of influence
            if (distance < center.radius && distance > 0.5) {
              // Normalize direction vector
              toCenter.normalize();

              // Calculate gravitational force (inverse square law)
              const forceMagnitude = (center.mass / (distance * distance)) * 0.01;

              // Apply gravitational acceleration toward center
              velocities[i3] += toCenter.x * forceMagnitude;
              velocities[i3 + 1] += toCenter.y * forceMagnitude;
              velocities[i3 + 2] += toCenter.z * forceMagnitude;

              // Add perpendicular force for orbital motion
              const perpFactor = 0.8;
              const perpForce = tempVector
                .crossVectors(toCenter, new THREE.Vector3(0, 0, 1))
                .normalize();
              perpForce.multiplyScalar(forceMagnitude * perpFactor);

              velocities[i3] += perpForce.x;
              velocities[i3 + 1] += perpForce.y;
              velocities[i3 + 2] += perpForce.z;
            }
          }

          // Apply velocity damping to prevent excessive speeds
          velocities[i3] *= 0.99;
          velocities[i3 + 1] *= 0.99;
          velocities[i3 + 2] *= 0.99;

          // Limit maximum velocity
          const maxVel = 0.2;
          const velMagnitude = Math.sqrt(
            velocities[i3] * velocities[i3] +
              velocities[i3 + 1] * velocities[i3 + 1] +
              velocities[i3 + 2] * velocities[i3 + 2]
          );

          if (velMagnitude > maxVel) {
            const scale = maxVel / velMagnitude;
            velocities[i3] *= scale;
            velocities[i3 + 1] *= scale;
            velocities[i3 + 2] *= scale;
          }

          // Basic movement from velocity
          positionArray[i3] += velocities[i3];
          positionArray[i3 + 1] += velocities[i3 + 1];
          positionArray[i3 + 2] += velocities[i3 + 2];

          // Add some oscillation for more interesting movement
          const oscillationX = Math.sin(elapsedTime * 0.3 + i * 0.1) * 0.005;
          const oscillationY = Math.cos(elapsedTime * 0.2 + i * 0.05) * 0.005;

          positionArray[i3] += oscillationX;
          positionArray[i3 + 1] += oscillationY;

          // Final distance check after all movements to ensure no particles got too close
          const finalPos = tempVector.set(
            positionArray[i3],
            positionArray[i3 + 1],
            positionArray[i3 + 2]
          );

          const finalDistance = cameraPos.distanceTo(finalPos);
          if (finalDistance < minCameraDistance) {
            // Emergency teleport away if still too close
            const safeDir = tempVector2.subVectors(finalPos, cameraPos).normalize();
            positionArray[i3] = cameraPos.x + safeDir.x * (minCameraDistance + 2);
            positionArray[i3 + 1] = cameraPos.y + safeDir.y * (minCameraDistance + 2);
            positionArray[i3 + 2] = cameraPos.z + safeDir.z * (minCameraDistance + 2);
          }

          // Simple wrapping to prevent clipping
          if (positionArray[i3] < -halfWidth) positionArray[i3] += halfWidth * 2;
          else if (positionArray[i3] > halfWidth) positionArray[i3] -= halfWidth * 2;

          if (positionArray[i3 + 1] < -halfHeight) positionArray[i3 + 1] += halfHeight * 2;
          else if (positionArray[i3 + 1] > halfHeight) positionArray[i3 + 1] -= halfHeight * 2;

          if (positionArray[i3 + 2] < -halfDepth) positionArray[i3 + 2] += halfDepth * 2;
          else if (positionArray[i3 + 2] > halfDepth) positionArray[i3 + 2] -= halfDepth * 2;
        }

        // Mark position attribute as updated
        particles.attributes.position.needsUpdate = true;

        // Gentle rotation of the entire system
        particleSystem.rotation.y += 0.0005;

        // Render scene
        renderer.render(scene, camera);

        // Continue animation loop
        animationId = requestAnimationFrame(animate);
      };

      // Start animation
      animate();

      // Return cleanup function
      return {
        cleanup: () => {
          cancelAnimationFrame(animationId);
          particles.dispose();
          material.dispose();
          renderer.dispose();

          // Clear references
          activeRenderer = null;
          activeCamera = null;
        },
      };
    };

    // Initial setup
    let sceneSetup = setupScene();

    // Handle theme changes
    const handleThemeChange = () => {
      // Clean up current scene
      sceneSetup.cleanup();

      // Setup new scene with new theme colors
      if (isMounted) {
        sceneSetup = setupScene();
      }
    };

    // Setup theme change listener
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          document.documentElement.classList.contains('dark') !==
            document.documentElement.classList.contains('light')
        ) {
          handleThemeChange();
        }
      });
    });

    // Start observing the html element for class changes
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Handle window resize with debounce
    const handleResize = debounce(() => {
      // Get current dimensions before cleanup
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Check if dimensions changed significantly (more than 5% in either dimension)
      const previousWidth = activeRenderer?.domElement?.width || 0;
      const previousHeight = activeRenderer?.domElement?.height || 0;

      const widthDiff = Math.abs(currentWidth - previousWidth) / previousWidth;
      const heightDiff = Math.abs(currentHeight - previousHeight) / previousHeight;

      // Skip resize if the change is within the dead zone (small changes)
      if (previousWidth > 0 && widthDiff < 0.05 && heightDiff < 0.05) {
        // Just update renderer size without rebuilding scene
        if (activeRenderer) {
          activeRenderer.setSize(currentWidth, currentHeight);

          // Also update camera aspect ratio
          if (activeCamera) {
            activeCamera.aspect = currentWidth / currentHeight;
            activeCamera.updateProjectionMatrix();
          }
        }
        return;
      }

      // For significant changes, clean up current scene and rebuild
      if (isMounted) {
        sceneSetup.cleanup();
        sceneSetup = setupScene();
      }
    }, 500); // 0.5 second debounce

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      mutationObserver.disconnect();
      sceneSetup.cleanup();
    };
  }, [theme, resolvedTheme]); // Re-run when theme changes

  return (
    <>
      {/* Particle Background */}
      <div
        ref={containerRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Blur Overlay - provides the subtle blur effect */}
      <div
        className="fixed inset-0 -z-10 backdrop-blur-[2px] bg-white/5 dark:bg-black/5 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
