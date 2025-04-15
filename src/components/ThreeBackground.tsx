'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// Simple debounce function
function debounce(func: ((...args: unknown[]) => void), wait: number) {
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
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [bunnyState, setBunnyState] = useState({
    happiness: 0,
    fullness: 0,
    message: 'Found me!',
    animation: false,
    petLevel: 0,
    feedLevel: 0
  });
  
  // Initialize bunny state from localStorage on component mount
  useEffect(() => {
    // Try to load saved state from localStorage
    try {
      const savedState = localStorage.getItem('bunnyState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setBunnyState(prevState => ({
          ...prevState,
          happiness: parsedState.happiness || 0,
          fullness: parsedState.fullness || 0,
          petLevel: parsedState.petLevel || 0,
          feedLevel: parsedState.feedLevel || 0
        }));
      }
    } catch (error) {
      console.error('Error loading bunny state:', error);
    }
  }, []);
  
  // Save bunny state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('bunnyState', JSON.stringify({
        happiness: bunnyState.happiness,
        fullness: bunnyState.fullness,
        petLevel: bunnyState.petLevel,
        feedLevel: bunnyState.feedLevel
      }));
    } catch (error) {
      console.error('Error saving bunny state:', error);
    }
  }, [bunnyState.happiness, bunnyState.fullness, bunnyState.petLevel, bunnyState.feedLevel]);
  
  // Handle bunny interactions
  const petBunny = () => {
    setBunnyState(prev => {
      const newHappiness = Math.min(prev.happiness + 25, 100);
      let newPetLevel = prev.petLevel;
      
      // Level up based on total happiness
      if (newHappiness >= 100 && prev.petLevel < 1) {
        newPetLevel = 1;
      } else if (newHappiness >= 100 && prev.happiness >= 100 && prev.petLevel < 2) {
        // Level 2 requires being at max happiness and petting again
        newPetLevel = 2;
      } else if (newHappiness >= 100 && prev.happiness >= 100 && prev.petLevel === 2) {
        // Level 3 requires being at max happiness, already at level 2, and petting again
        newPetLevel = 3;
      }
      
      return {
        ...prev,
        happiness: newHappiness,
        message: newHappiness >= 75 ? 'So happy!' : 'Pet pet pet!',
        animation: true,
        petLevel: newPetLevel
      };
    });
    
    // Reset animation flag after a delay
    setTimeout(() => {
      setBunnyState(prev => ({
        ...prev,
        animation: false
      }));
    }, 500);
  };
  
  const feedBunny = () => {
    setBunnyState(prev => {
      const newFullness = Math.min(prev.fullness + 25, 100);
      let newFeedLevel = prev.feedLevel;
      
      // Level up based on total fullness
      if (newFullness >= 100 && prev.feedLevel < 1) {
        newFeedLevel = 1;
      } else if (newFullness >= 100 && prev.fullness >= 100 && prev.feedLevel < 2) {
        // Level 2 requires being at max fullness and feeding again
        newFeedLevel = 2;
      } else if (newFullness >= 100 && prev.fullness >= 100 && prev.feedLevel === 2) {
        // Level 3 requires being at max fullness, already at level 2, and feeding again
        newFeedLevel = 3;
      }
      
      return {
        ...prev,
        fullness: newFullness,
        message: newFullness >= 75 ? 'So full!' : 'Nom nom nom!',
        animation: true,
        feedLevel: newFeedLevel
      };
    });
    
    // Reset animation flag after a delay
    setTimeout(() => {
      setBunnyState(prev => ({
        ...prev,
        animation: false
      }));
    }, 500);
  };
  
  // Get secret messages for different levels
  const getPetSecretMessage = (level: number) => {
    switch (level) {
      case 1:
        return "You're becoming friends with the bunny...";
      case 2:
        return "The bunny whispers: 'I can show you the secrets of the universe...'";
      case 3:
        return "REALITY BENDS TO THE BUNNY'S WILL. YOU ARE ONE WITH THE BUNNY NOW.";
      default:
        return "";
    }
  };
  
  const getFeedSecretMessage = (level: number) => {
    switch (level) {
      case 1:
        return "The bunny's power grows with each carrot...";
      case 2:
        return "The bunny's eyes glow faintly... something is awakening...";
      case 3:
        return "THE ANCIENT ONE AWAKENS. THE CARROT GOD HAS RETURNED.";
      default:
        return "";
    }
  };
  
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
      const currentTheme = theme === 'dark' || resolvedTheme === 'dark' ? 'dark' : 'light';
      
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
      
      const bounds = getBoundaries();
      
      // Create orbital centers that particles will orbit around
      const createOrbitalCenters = () => {
        // Create orbital centers
        const centers = [];
        
        // Add main orbital center at the middle
        centers.push({
          position: new THREE.Vector3(0, 0, 5), // Centered in camera view
          mass: 1.5,  // Stronger mass for more defined orbit
          radius: 30  // Large radius to affect most particles
        });
        
        // Add second orbital center offset from the main one
        centers.push({
          position: new THREE.Vector3(8, -5, 7), // Offset position
          mass: 0.8,  // Slightly weaker mass
          radius: 20  // Smaller radius of influence
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
          const baseRadius = orbitRadius + (Math.random() * orbitThickness - orbitThickness/2);
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
          velocities[i3] = -Math.sin(angle) * speed;      // Tangential direction
          velocities[i3 + 1] = Math.cos(angle) * speed;   // Tangential direction
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
        blending: THREE.AdditiveBlending
      });
      
      // Create shader material for custom opacity per particle
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          pointTexture: { value: null }
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
        vertexColors: true
      });
      
      // Create particle system with shader material
      const particleSystem = new THREE.Points(particles, shaderMaterial);
      scene.add(particleSystem);
      
      // Track mouse for interactivity
      let mouseX = 0;
      let mouseY = 0;
      
      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      // Animation loop
      const clock = new THREE.Clock();
      let animationId: number;
      
      // Fade-in animation variables
      const fadeInDuration = 6.0; // Slower fade-in over 6 seconds instead of 2
      const targetOpacity = 0.8; // Final opacity value
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
            const individualDelay = i / particleCount * 2.0; // Stagger over 2 seconds
            const individualProgress = Math.max(0, Math.min(1, (fadeProgress * fadeInDuration - individualDelay) / (fadeInDuration - individualDelay * 0.5)));
            
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
              
              // Add perpendicular force for orbital motion
              const perpFactor = 0.8;
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
  
  // Get ASCII art based on bunny happiness and fullness
  const getBunnyArt = () => {
    const isHappy = bunnyState.happiness >= 50;
    const isFull = bunnyState.fullness >= 50;
    
    // Different bunny states
    if (isHappy && isFull) {
      return bunnyState.animation ? 
      `  \\(\\)/   
 ( ^.^ )  
 o(\")(\")`
      : 
      `  \\(\\)/   
 ( ^.^ )  
 o(\")(\")`;
    } else if (isHappy) {
      return bunnyState.animation ? 
      `  \\(\\)    
 ( ^.^ )~ 
 o(\")(\")`
      : 
      `  \\(\\)/   
 ( ^.^ )  
 o(\")(\")`;
    } else if (isFull) {
      return bunnyState.animation ? 
      `  \\(\\)/   
 ( o.o )  
 O(\")(\")o`
      : 
      `  \\(\\)/   
 ( o.o )  
 O(\")(\")`;
    } else {
      return bunnyState.animation ? 
      `  \\(\\)    
 ( ·.· )~ 
 o(\")(\") `
      : 
      `  \\(\\)/   
 ( ·.· )  
 o(\")(\")`;
    }
  };
  
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
      
      {/* Interactive Bunny Easter Egg */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-1000 z-10 ${
          showEasterEgg ? "opacity-90 hover:opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div 
          className="px-6 py-4 bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-black rounded-xl shadow-lg flex flex-col items-center relative"
        >
          <pre className="font-mono text-sm whitespace-pre mb-1 select-none">
            {getBunnyArt()}
          </pre>
          <p className="text-xs font-medium my-1">{bunnyState.message}</p>
          <div className="flex gap-2 mt-2">
            <div className="relative group">
              <button 
                onClick={petBunny}
                className="px-3 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors"
              >
                Pet
              </button>
              
              {/* Pet Secret Messages - Only Visible on Hover */}
              {bunnyState.petLevel >= 1 && (
                <div className="absolute left-0 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-2 py-1 bg-blue-900/90 text-blue-100 rounded text-2xs whitespace-nowrap max-w-[200px]">
                    {getPetSecretMessage(1)}
                  </div>
                </div>
              )}
              
              {bunnyState.petLevel >= 2 && (
                <div className="absolute left-0 bottom-full mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none">
                  <div className="px-2 py-1 bg-purple-900/90 text-purple-100 rounded text-2xs whitespace-nowrap max-w-[200px] font-medium italic">
                    {getPetSecretMessage(2)}
                  </div>
                </div>
              )}
              
              {bunnyState.petLevel >= 3 && (
                <div className="absolute left-0 bottom-full mb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 pointer-events-none">
                  <div className="px-2 py-1 bg-red-900/90 text-red-100 rounded text-2xs whitespace-nowrap max-w-[200px] font-bold animate-pulse">
                    {getPetSecretMessage(3)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative group">
              <button 
                onClick={feedBunny}
                className="px-3 py-1 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-md text-xs font-medium transition-colors"
              >
                Feed
              </button>
              
              {/* Feed Secret Messages - Only Visible on Hover */}
              {bunnyState.feedLevel >= 1 && (
                <div className="absolute right-0 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-2 py-1 bg-orange-900/90 text-orange-100 rounded text-2xs whitespace-nowrap max-w-[200px]">
                    {getFeedSecretMessage(1)}
                  </div>
                </div>
              )}
              
              {bunnyState.feedLevel >= 2 && (
                <div className="absolute right-0 bottom-full mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none">
                  <div className="px-2 py-1 bg-amber-900/90 text-amber-100 rounded text-2xs whitespace-nowrap max-w-[200px] font-medium italic">
                    {getFeedSecretMessage(2)}
                  </div>
                </div>
              )}
              
              {bunnyState.feedLevel >= 3 && (
                <div className="absolute right-0 bottom-full mb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 pointer-events-none">
                  <div className="px-2 py-1 bg-yellow-900/90 text-yellow-100 rounded text-2xs whitespace-nowrap max-w-[200px] font-bold animate-pulse">
                    {getFeedSecretMessage(3)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Level indicator - subtle numbers showing progress */}
          <div className="flex justify-between w-full mt-2 px-1 text-[8px] text-gray-400 dark:text-gray-500">
            <span>Lvl {bunnyState.petLevel}/3</span>
            <span>Lvl {bunnyState.feedLevel}/3</span>
          </div>
        </div>
      </div>
      
      {/* Global style for extra small text */}
      <style jsx global>{`
        .text-2xs {
          font-size: 0.65rem;
          line-height: 1rem;
        }
      `}</style>
    </>
  );
}


