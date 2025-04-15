'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// Simple debounce function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
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
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Track if the component is mounted
    let isMounted = true;
    
    // Add scroll listener for easter egg
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // Show easter egg when scrolled to bottom (within 100px)
      const bottomThreshold = pageHeight - windowHeight - 100;
      setShowEasterEgg(scrollPosition > bottomThreshold);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Create scene, camera, renderer
    const setupScene = () => {
      // Clear any existing canvas
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Initialize the scene
      const scene = new THREE.Scene();
      
      // Determine if we're in dark or light mode
      const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
      
      // Create a camera with greater field of view and frustum
      const camera = new THREE.PerspectiveCamera(
        70, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        2000
      );
      camera.position.z = 15;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: false, 
        alpha: true 
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
          depth: 30
        };
      };
      
      let bounds = getBoundaries();
      
      // Create orbital centers that particles will orbit around
      const createOrbitalCenters = () => {
        // Create 3-5 orbital centers for particles to orbit around
        const centers = [];
        const numCenters = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numCenters; i++) {
          // All orbital centers start at the center (origin) of the scene
          const x = 0;
          const y = 0;
          const z = 0;
          
          // Each center has different gravitational pull
          // Vary mass and radius more dramatically since positions are the same
          const mass = 0.2 + Math.random() * 0.8; // Center mass/strength
          const radius = 5 + Math.random() * 15; // Wider range of orbital influence radius
          
          centers.push({
            position: new THREE.Vector3(x, y, z),
            mass,
            radius
          });
        }
        
        return centers;
      };
      
      // Create orbital centers
      const orbitalCenters = createOrbitalCenters();
      
      // Add a dynamic orbital center that follows the mouse
      const mouseOrbitalCenter = {
        position: new THREE.Vector3(0, 0, 10), // Initial position
        mass: 1000, // Stronger mass for more noticeable effect
        radius: .1, // Larger radius of influence
        isMouseCenter: true // Flag to identify this special center
      };
      
      // Add mouse center to the array
      orbitalCenters.push(mouseOrbitalCenter);
      
      // We'll keep orbital centers as invisible force points - no visible spheres
      // This removes the large static glowing orbs while keeping the orbital mechanics
      
      // Create particles
      const particleCount = 2000;
      
      // Create geometry and buffers
      const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

      // Initialize particles with random positions and velocities
      const initializeParticles = () => {
        // Determine color palette based on theme
        const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
        
        // Calculate visible screen boundaries at z=0 (camera's viewing plane)
        const visibleBounds = {
          width: bounds.width * 0.5, // Just the actual visible area, not the full bounds
          height: bounds.height * 0.5
        };
        
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          
          // Position particles off-screen
          // Initialize with default values to satisfy TypeScript
          let x = 0;
          let y = 0;
          let z = 0;
          
          // Determine which edge to spawn from
          const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
          const depthVariation = (Math.random() - 0.5) * bounds.depth;
          
          switch(edge) {
            case 0: // Top edge
              x = (Math.random() - 0.5) * bounds.width * 1.5;
              y = visibleBounds.height + Math.random() * visibleBounds.height * 0.5;
              z = depthVariation;
              break;
            case 1: // Right edge
              x = visibleBounds.width + Math.random() * visibleBounds.width * 0.5;
              y = (Math.random() - 0.5) * bounds.height * 1.5;
              z = depthVariation;
              break;
            case 2: // Bottom edge
              x = (Math.random() - 0.5) * bounds.width * 1.5;
              y = -(visibleBounds.height + Math.random() * visibleBounds.height * 0.5);
              z = depthVariation;
              break;
            case 3: // Left edge
              x = -(visibleBounds.width + Math.random() * visibleBounds.width * 0.5);
              y = (Math.random() - 0.5) * bounds.height * 1.5;
              z = depthVariation;
              break;
          }
          
          // Set position
          positions[i3] = x;
          positions[i3 + 1] = y;
          positions[i3 + 2] = z;
          
          // Calculate velocity toward the center of the screen
          const pos = new THREE.Vector3(x, y, z);
          const center = new THREE.Vector3(0, 0, 0);
          const toCenter = new THREE.Vector3().subVectors(center, pos).normalize();
          
          // Basic velocity toward center
          const initialSpeed = 0.02 + Math.random() * 0.06;
          velocities[i3] = toCenter.x * initialSpeed;
          velocities[i3 + 1] = toCenter.y * initialSpeed;
          velocities[i3 + 2] = toCenter.z * initialSpeed * 0.2; // Less z-velocity
          
          // Add some tangential motion for more interesting entry paths
          const perpVector = new THREE.Vector3(0, 0, 1);
          const tangent = new THREE.Vector3().crossVectors(toCenter, perpVector).normalize();
          const tangentialFactor = (Math.random() - 0.5) * 0.03;
          
          velocities[i3] += tangent.x * tangentialFactor;
          velocities[i3 + 1] += tangent.y * tangentialFactor;
          
          // Add some brighter particles to represent main stars (replacing the static orbs)
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
      
      // Create material
      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.0, // Start fully transparent for fade-in effect
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
      });
      
      // Create particle system
      const particleSystem = new THREE.Points(particles, material);
      scene.add(particleSystem);
      
      // Track mouse for interactivity
      let mouseX = 0;
      let mouseY = 0;
      
      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update the position of the mouse orbital center
        const mouseWorldPos = new THREE.Vector3(
          mouseX * bounds.width * 0.3, // Scale to match the scene dimensions
          mouseY * bounds.height * 0.3,
          camera.position.z - 10 // Keep in front of the camera
        );
        
        // Find the mouse orbital center and update its position
        const mouseCenter = orbitalCenters.find(center => (center as any).isMouseCenter);
        if (mouseCenter) {
          // Use lerp for smoother movement
          mouseCenter.position.lerp(mouseWorldPos, 0.1);
        }
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      // Animation loop
      const clock = new THREE.Clock();
      let animationId: number;
      
      // Fade-in animation variables
      const fadeInDuration = 2.0; // Fade-in over 2 seconds
      const targetOpacity = 0.7; // Final opacity value
      let startTime = clock.getElapsedTime();
      let isFadingIn = true;
      
      // Start with centers clustered, then gradually move them outward
      let centersExpanding = true;
      const expansionDuration = 5.0; // Expand over 5 seconds
      
      // Temp vectors for physics calculations (reused for performance)
      const tempVector = new THREE.Vector3();
      const tempVector2 = new THREE.Vector3();
      
      const animate = () => {
        if (!isMounted) return;
        
        const deltaTime = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Handle fade-in effect
        if (isFadingIn) {
          const fadeTime = elapsedTime - startTime;
          const fadeProgress = Math.min(fadeTime / fadeInDuration, 1.0);
          
          // Use smooth easing function
          const easedProgress = 1 - Math.pow(1 - fadeProgress, 3); // Cubic ease-out
          material.opacity = easedProgress * targetOpacity;
          
          if (fadeProgress >= 1.0) {
            isFadingIn = false;
          }
        }
        
        // Gradually expand orbital centers from the center
        if (centersExpanding) {
          const expansionTime = elapsedTime - startTime;
          const expansionProgress = Math.min(expansionTime / expansionDuration, 1.0);
          
          // Use easing function for smooth expansion
          const easedExpansion = 1 - Math.pow(1 - expansionProgress, 2); // Quadratic ease-out
          
          // Expand all centers except the mouse orbital center
          for (let i = 0; i < orbitalCenters.length; i++) {
            const center = orbitalCenters[i];
            
            // Skip the mouse orbital center
            if ((center as any).isMouseCenter) continue;
            
            // Create target position if it doesn't exist yet
            if (!(center as any).targetPosition) {
              // Target position is a random point away from center
              const angle = Math.random() * Math.PI * 2;
              const radius = (bounds.width * 0.3) * (0.4 + Math.random() * 0.6); // 40-100% of 30% of bounds width
              
              const tx = Math.cos(angle) * radius;
              const ty = Math.sin(angle) * radius;
              const tz = (Math.random() - 0.5) * bounds.depth * 0.3;
              
              (center as any).targetPosition = new THREE.Vector3(tx, ty, tz);
            }
            
            // Interpolate toward target position
            center.position.lerp(
              (center as any).targetPosition,
              easedExpansion * 0.02 // Gradual movement
            );
          }
          
          // End expansion when complete
          if (expansionProgress >= 1.0) {
            centersExpanding = false;
          }
        }
        
        // Update camera based on mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
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
        const cameraPos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

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
              const forceMagnitude = center.mass / (distance * distance) * 0.01;
              
              // Apply gravitational acceleration toward center
              velocities[i3] += toCenter.x * forceMagnitude;
              velocities[i3 + 1] += toCenter.y * forceMagnitude;
              velocities[i3 + 2] += toCenter.z * forceMagnitude;
              
              // Add stronger perpendicular force for mouse orbital center
              const perpFactor = (center as any).isMouseCenter ? 1.5 : 0.8;
              const perpForce = tempVector.crossVectors(toCenter, new THREE.Vector3(0, 0, 1)).normalize();
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
          window.removeEventListener('mousemove', handleMouseMove);
          cancelAnimationFrame(animationId);
          particles.dispose();
          material.dispose();
          renderer.dispose();
        }
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
      attributeFilter: ['class']
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
      window.removeEventListener('scroll', handleScroll);
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
      
      {/* Hidden Easter Egg */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-1000 z-10 ${
          showEasterEgg ? "opacity-70 hover:opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div 
          className="px-4 py-2 bg-black/70 dark:bg-white/70 text-white dark:text-black rounded-full text-sm font-mono shadow-lg"
          title="You found the secret message!"
        >
          console.log("h4ck3r m0d3 4ct1v4t3d... 🔥");
        </div>
      </div>
    </>
  );
}


