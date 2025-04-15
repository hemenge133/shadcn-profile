'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function BunnyEasterEgg() {
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
  
  // Add scroll listener for easter egg
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // Show easter egg when scrolled to bottom (within 100px)
      const bottomThreshold = pageHeight - windowHeight - 100;
      setShowEasterEgg(scrollPosition > bottomThreshold);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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