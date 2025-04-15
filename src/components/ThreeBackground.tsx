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
      camera.position.z = 12;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

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
          mass: 0.6, // Reduced from 0.9 to allow more varied motion
          radius: 1, // Increased radius for broader influence
        });

        // Add second orbital center offset from the main one
        centers.push({
          position: new THREE.Vector3(8, -5, 7), // Offset position
          mass: 0.5, // Slightly weaker mass
          radius: 0.8, // Smaller radius of influence
        });

        // Add mouse-controlled orbital center
        centers.push({
          position: new THREE.Vector3(0, 0, 10), // Start position, will follow mouse
          mass: 5, // Medium strength
          radius: 7, // Medium radius
          isMouseControlled: true, // Flag for mouse control
        });

        // Add several smaller random orbital centers for more interesting motion
        const numSmallCenters = Math.floor(Math.random() * 3) + 8; // Random 8-12 centers

        for (let i = 0; i < numSmallCenters; i++) {
          // Create random position within scene bounds
          // Mostly in XY plane due to our constraints
          const randomX = (Math.random() * 2 - 1) * 25; // -25 to 25
          const randomY = (Math.random() * 2 - 1) * 20; // -20 to 20
          const randomZ = (Math.random() * 2 - 1) * 3; // -3 to 3 (very flat)

          // Random mass (smaller than main centers but still influential)
          const mass = Math.random() * 0.2 + 0.05;

          // Random radius of influence
          const radius = Math.random() * 0.2 + 0.4;

          centers.push({
            position: new THREE.Vector3(randomX, randomY, randomZ),
            mass: mass,
            radius: radius,
            isSmallCenter: true, // Flag for small centers
          });
        }

        return centers;
      };

      // Create orbital centers
      const orbitalCenters = createOrbitalCenters();

      // DEBUG: Create visible circle to show mouse gravity radius
      // Get the mouse orbital center's radius (we know it's the 3rd center, index 2)
      const mouseOrbitalRadius = orbitalCenters[2].radius || 0.5;

      // Create a filled circle with CircleGeometry
      const debugCircleGeometry = new THREE.CircleGeometry(mouseOrbitalRadius, 64);
      const debugCircleMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });

      const debugCircle = new THREE.Mesh(debugCircleGeometry, debugCircleMaterial);

      // Create an outline as well
      const outlineGeometry = new THREE.RingGeometry(
        mouseOrbitalRadius - 0.05,
        mouseOrbitalRadius + 0.05,
        64
      );
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: false,
        side: THREE.DoubleSide,
      });
      const outlineCircle = new THREE.Mesh(outlineGeometry, outlineMaterial);

      // Set initial positions
      debugCircle.position.copy(orbitalCenters[2].position);
      outlineCircle.position.copy(orbitalCenters[2].position);

      // Make circles face the camera by setting them as billboards
      // We'll update their orientation in the animation loop

      // Add to scene
      scene.add(debugCircle);
      scene.add(outlineCircle);

      // We'll keep orbital centers as invisible force points - no visible spheres

      // Create particles
      const particleCount = 10000;

      // Create geometry and buffers
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const opacityValues = new Float32Array(particleCount); // For individual fade-in control

      // XY-plane constraint settings
      const xyPlaneForceStrength = 0.3; // Force applied to velocity
      const xyPlaneDirectConstraint = 0.92; // Direct position constraint (0-1, higher = flatter)

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

      // Performance optimization: disable frustum culling for particles
      // Since we're handling the boundaries ourselves and all particles are in one object
      particleSystem.frustumCulled = false;

      // Performance optimization: set material's precision to medium or low
      // This won't affect visual quality noticeably but improves shader compilation
      shaderMaterial.precision = 'mediump';

      // Performance flag: inform Three.js this object won't receive shadows
      particleSystem.receiveShadow = false;
      particleSystem.castShadow = false;

      // Animation loop
      const clock = new THREE.Clock();
      let animationId: number;

      // Fade-in animation variables
      const fadeInDuration = 10.0; // Slower fade-in over 10 seconds
      const targetOpacity = currentTheme === 'dark' ? 0.7 : 0.9; // Higher opacity for light mode
      const startTime = clock.getElapsedTime();
      let isFadingIn = true;

      // Start with centers clustered, then gradually move them outward
      const centersExpanding = false; // We don't need expansion anymore since we start with one center

      // Second mass rotation parameters
      const secondMassRotationSpeed = 0.2; // Rotation speed in radians per second
      const secondMassDistance = 9.5; // Distance from primary mass (derived from the initial position)

      // Mouse tracking for orbital center
      let mouseX = 0;
      let mouseY = 0;

      // Add mouse move listener
      const handleMouseMove = (event: MouseEvent) => {
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

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

          // Update mouse-controlled orbital center position
          // Project mouse position into 3D space at a fixed z-distance
          const mouseCenter = orbitalCenters[2];
          if (mouseCenter && mouseCenter.isMouseControlled) {
            // Calculate world position from normalized device coordinates
            const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
            vector.unproject(camera);

            const dir = vector.sub(camera.position).normalize();
            const distance = (10 - camera.position.z) / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            mouseCenter.position.x = pos.x;
            mouseCenter.position.y = pos.y;

            // DEBUG: Update debug circle position to match
            debugCircle.position.x = pos.x;
            debugCircle.position.y = pos.y;
            debugCircle.position.z = mouseCenter.position.z;

            // Update outline position too
            outlineCircle.position.x = pos.x;
            outlineCircle.position.y = pos.y;
            outlineCircle.position.z = mouseCenter.position.z;

            // Make circles always face camera (billboard effect)
            debugCircle.lookAt(camera.position);
            outlineCircle.lookAt(camera.position);
          }

          // Animate small orbital centers with gentle drifting motion
          for (let i = 3; i < orbitalCenters.length; i++) {
            const center = orbitalCenters[i];
            if (center.isSmallCenter) {
              // Each small center gets a unique motion pattern based on its index
              const speedFactor = 0.1 + (i % 5) * 0.05; // Different speeds

              // Circular/elliptical motion with oscillation
              center.position.x += Math.sin(elapsedTime * speedFactor + i) * 0.02;
              center.position.y += Math.cos(elapsedTime * speedFactor * 1.3 + i) * 0.02;

              // Keep the z-motion limited to maintain XY plane emphasis
              center.position.z = Math.sin(elapsedTime * 0.2 + i * 2) * 0.8;

              // Apply boundaries to keep centers in visible area
              if (Math.abs(center.position.x) > 25) center.position.x *= 0.98;
              if (Math.abs(center.position.y) > 20) center.position.y *= 0.98;
            }
          }
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
            if (distance < center.radius && distance > 0.1) {
              // Normalize direction vector
              toCenter.normalize();

              // Calculate gravitational force (inverse square law)
              let forceMagnitude;

              if (center.isMouseControlled) {
                // Much stronger direct pull for mouse without the small multiplier
                // Use a high minimum value to ensure strong pull even at distance
                forceMagnitude = Math.max(center.mass / (distance * distance), 1.0);
              } else {
                // Regular orbital centers use standard formula with small multiplier
                forceMagnitude = (center.mass / (distance * distance)) * 0.01;
              }

              // Apply gravitational acceleration toward center
              velocities[i3] += toCenter.x * forceMagnitude;
              velocities[i3 + 1] += toCenter.y * forceMagnitude;
              velocities[i3 + 2] += toCenter.z * forceMagnitude;

              // Add perpendicular force for orbital motion (always in XY plane)
              if (center.isMouseControlled) {
                // Create a strong vortex effect around the mouse
                // Strength increases dramatically as particles get closer
                const distanceFactor = 1.0 - Math.min(distance / center.radius, 0.9); // 0-1 value, higher when closer

                // Exponential increase in force as particles get closer
                const vortexStrength = Math.pow(distanceFactor, 2) * 2.5;

                // Create swirling motion in the XY plane
                const perpForce = new THREE.Vector3(-toCenter.y, toCenter.x, 0).normalize();

                // Combine both direct pull and strong perpendicular force for vortex effect
                // Stronger tangential (swirl) force than radial (pull) force
                velocities[i3] += perpForce.x * forceMagnitude * vortexStrength;
                velocities[i3 + 1] += perpForce.y * forceMagnitude * vortexStrength;

                // Add a slight inward pull to create the vortex cone shape
                velocities[i3] += toCenter.x * forceMagnitude * 0.5;
                velocities[i3 + 1] += toCenter.y * forceMagnitude * 0.5;

                // Apply slight pull toward XY plane for flatter vortex
                const heightAbovePlane = Math.abs(particlePos.z - center.position.z);
                if (heightAbovePlane > 0.2) {
                  const zPull = (center.position.z - particlePos.z) * 0.1;
                  velocities[i3 + 2] += zPull;
                }

                // Color shift for particles caught in the vortex
                if (distance < center.radius * 0.8 && Math.random() < 0.02) {
                  // Occasionally brighten particles in the vortex
                  const colorsArray = particles.attributes.color.array as Float32Array;
                  const i3Color = i * 3;

                  // Shift color toward bright cyan/blue for vortex effect
                  colorsArray[i3Color] = Math.min(colorsArray[i3Color] * 1.1, 1.0); // R
                  colorsArray[i3Color + 1] = Math.min(colorsArray[i3Color + 1] * 1.2 + 0.1, 1.0); // G
                  colorsArray[i3Color + 2] = Math.min(colorsArray[i3Color + 2] * 1.2 + 0.2, 1.0); // B

                  // Mark colors for update
                  particles.attributes.color.needsUpdate = true;
                }
              } else {
                // Regular orbital centers
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
          }

          // Apply XY-plane force to push particles back to z=0
          // This will prevent particles from orbiting mostly in the z-plane
          const zForce = -positionArray[i3 + 2] * xyPlaneForceStrength;
          velocities[i3 + 2] += zForce;

          // Additional damping specifically for z-velocity to further flatten orbits
          velocities[i3 + 2] *= 0.96; // Extra damping for z-velocity

          // Direct position constraint - forcibly flatten toward XY plane
          // This directly moves particles toward z=0 regardless of velocity
          positionArray[i3 + 2] *= 1 - xyPlaneDirectConstraint;

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
            // Special case: don't limit velocity for particles being strongly affected by mouse
            // Check if any mouse center is close enough to affect this particle
            let isStronglyAffectedByMouse = false;

            for (const center of orbitalCenters) {
              if (center.isMouseControlled) {
                const distToMouse = tempVector
                  .set(positionArray[i3], positionArray[i3 + 1], positionArray[i3 + 2])
                  .distanceTo(center.position);

                if (distToMouse < center.radius * 1.5) {
                  isStronglyAffectedByMouse = true;
                  break;
                }
              }
            }

            // Only apply velocity limit if not affected by mouse
            if (!isStronglyAffectedByMouse) {
              const scale = maxVel / velMagnitude;
              velocities[i3] *= scale;
              velocities[i3 + 1] *= scale;
              velocities[i3 + 2] *= scale;
            }
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

        // Performance optimization: Only update other attributes when they change
        // We now might update colors for the vortex effect, so this commented out:
        // particles.attributes.color.needsUpdate = false;
        // particles.attributes.size.needsUpdate = false;

        // Only update opacity during fade-in
        if (isFadingIn) {
          particles.attributes.opacity.needsUpdate = true;
        }

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
          debugCircleGeometry.dispose();
          debugCircleMaterial.dispose();
          outlineGeometry.dispose();
          outlineMaterial.dispose();
          renderer.dispose();
          window.removeEventListener('mousemove', handleMouseMove);
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
      // Clean up current scene
      sceneSetup.cleanup();

      // Setup new scene
      if (isMounted) {
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
