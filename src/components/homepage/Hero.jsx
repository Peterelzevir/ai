'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

// Memoized background component to prevent unnecessary re-renders
const AnimatedBackground = memo(() => (
  <div className="absolute inset-0 overflow-hidden will-change-transform">
    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    
    <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-800"></div>
    
    {/* Using CSS animations for background gradients to reduce JS overhead */}
    <div 
      className="absolute top-0 left-0 w-full h-full opacity-30 animate-gradient"
      style={{
        background: 'radial-gradient(circle at 30% 40%, rgba(0, 100, 255, 0.1), transparent 40%)'
      }}
    />
    
    <div className="absolute -top-1/4 -left-1/4 w-full h-full animate-float-slow">
      <div className="w-full h-full rounded-full bg-accent/5 blur-3xl transform-gpu"></div>
    </div>
    
    <div className="absolute -bottom-1/4 -right-1/4 w-full h-full animate-float-reverse">
      <div className="w-full h-full rounded-full bg-accent/5 blur-3xl transform-gpu"></div>
    </div>
  </div>
));
AnimatedBackground.displayName = 'AnimatedBackground';

// Memoized loading component
const LoadingScreen = memo(({ loadingProgress, onComplete }) => {
  useEffect(() => {
    // Optimize loading animation using CSS transitions and reduced JS intervals
    const loadingInterval = setInterval(() => {
      if (loadingProgress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(onComplete, 300);
        return;
      }
    }, 50);
    
    return () => clearInterval(loadingInterval);
  }, [loadingProgress, onComplete]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary-900 overflow-hidden">
      <div className="text-center max-w-md px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center transform-gpu"
        >
          <Image 
            src="/images/logo.svg" 
            alt="AI Peter Logo"
            width={60}
            height={60}
            className="animate-pulse"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-50 to-accent transform-gpu"
        >
          AI Peter
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-base text-primary-200 mb-8 transform-gpu"
        >
          Loading your super modern chatbot experience...
        </motion.div>
        
        {/* Enhanced progress bar with CSS animation */}
        <div className="w-full max-w-xs mx-auto bg-primary-800/50 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light shadow-glow rounded-full transition-all duration-100 ease-out transform-gpu"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-primary-300 inline-flex items-center transform-gpu"
        >
          {loadingProgress < 100 ? (
            <>{loadingProgress}%</>
          ) : (
            <span className="flex items-center">
              Ready
              <svg className="w-4 h-4 ml-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
});
LoadingScreen.displayName = 'LoadingScreen';

// Main component with optimizations
export default function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [typeText, setTypeText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const fullText = "AI adalah masa depan";
  const typingRef = useRef(null);
  
  // Use CSS animation progress simulated with state
  useEffect(() => {
    // Optimize with fewer state updates
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          return 100;
        }
        
        // Smoother, less frequent updates
        const increment = Math.max(1, Math.floor(5 * Math.sin((prev / 100) * Math.PI)) + 3);
        return Math.min(100, prev + increment);
      });
    }, 80); // Less frequent updates to reduce re-renders
    
    return () => clearInterval(loadingInterval);
  }, []);
  
  // Optimized typing animation using a more efficient approach
  useEffect(() => {
    if (inView && isLoaded) {
      let i = 0;
      const step = () => {
        if (i < fullText.length) {
          setTypeText(fullText.substring(0, i + 1));
          i++;
          setTimeout(step, 60);
        } else if (typingRef.current) {
          typingRef.current.classList.add('blinking-cursor');
        }
      };
      
      // Start typing with a small delay
      setTimeout(step, 300);
    }
  }, [inView, isLoaded, fullText]);

  if (!isLoaded) {
    return <LoadingScreen loadingProgress={loadingProgress} onComplete={() => setIsLoaded(true)} />;
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-primary-900" ref={ref}>
      {/* Use memoized background for better performance */}
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 text-center z-10 py-16 md:py-24">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="mb-6 md:mb-8 inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Image 
              src="/images/logo.svg" 
              alt="AI Peter Logo"
              width={120}
              height={120}
              className="mx-auto drop-shadow-glow"
              priority
            />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-50 via-accent-light to-accent leading-tight transform-gpu"
          >
            AI Peter
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="block text-xl md:text-3xl lg:text-4xl mt-4 text-primary-100 font-light transform-gpu"
            >
              Super Modern AI Chatbot
            </motion.span>
          </motion.h1>

          <motion.div 
            className="h-12 mb-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div 
              ref={typingRef}
              className="text-lg md:text-2xl text-primary-200 font-mono inline-block overflow-hidden whitespace-nowrap"
            >
              {typeText}
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-5 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl font-medium transition-all duration-300 text-lg shadow-glow transform-gpu"
              >
                Start Chatting Now
              </motion.button>
            </Link>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-primary-800/50 backdrop-blur-sm border border-primary-600/50 text-primary-50 rounded-xl font-medium hover:border-accent/50 transition-all duration-300 text-lg transform-gpu"
              >
                Discover Features
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Chat preview component - optimized with reduced animations */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 relative max-w-3xl mx-auto transform-gpu"
        >
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-primary-600/30 shadow-xl bg-primary-800/40 backdrop-blur-lg">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/5 to-transparent"></div>
            
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                  <Image 
                    src="/images/avatar.svg" 
                    alt="AI Peter" 
                    width={40} 
                    height={40} 
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <div className="text-primary-50 font-medium">AI Peter</div>
                  <div className="text-xs text-primary-300 flex items-center">
                    <span className="flex w-2 h-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online now
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="p-4 bg-primary-700/60 backdrop-blur-sm rounded-xl max-w-[80%] transform-gpu"
                >
                  <p className="text-primary-50">Hello there! I'm Peter, your AI assistant. How can I help you today?</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="ml-auto p-4 bg-accent/20 backdrop-blur-sm rounded-xl max-w-[80%] transform-gpu"
                >
                  <p className="text-primary-50">Can you help me with some information about the latest AI advancements?</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-start max-w-[80%]"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                    <Image 
                      src="/images/avatar.svg" 
                      alt="AI Peter" 
                      width={32} 
                      height={32} 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="typing-animation bg-primary-700/60 backdrop-blur-sm p-4 rounded-xl">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Use CSS animations for decorative elements */}
          <div
            className="absolute -bottom-5 -right-5 w-16 h-16 rounded-xl bg-accent/10 backdrop-blur-sm border border-accent/20 z-10 animate-float-small transform-gpu"
          />
          <div
            className="absolute -top-5 -left-5 w-16 h-16 rounded-xl bg-primary-800/50 backdrop-blur-sm border border-primary-600/30 z-10 animate-float-small-reverse transform-gpu"
          />
          
          <div
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-accent animate-bounce-slow"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-8 h-8"
            >
              <path d="M7 13l5 5 5-5"></path>
              <path d="M7 6l5 5 5-5"></path>
            </svg>
          </div>
        </motion.div>
      </div>
      
      {/* Add optimized CSS with hardware acceleration support */}
      <style jsx global>{`
        /* Add will-change hints to optimize animations */
        .transform-gpu {
          will-change: transform;
          transform: translateZ(0);
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(0, 120, 255, 0.3);
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(0, 120, 255, 0.3));
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .blinking-cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
          margin-left: 2px;
        }
        
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .typing-animation span {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
        }
        
        .typing-animation span:nth-child(1) {
          animation: bounce 1s infinite 0.2s;
        }
        
        .typing-animation span:nth-child(2) {
          animation: bounce 1s infinite 0.4s;
        }
        
        .typing-animation span:nth-child(3) {
          animation: bounce 1s infinite 0.6s;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Optimized CSS animations to replace JS animations */
        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        .animate-gradient {
          animation: gradient-shift 20s infinite alternate;
        }
        
        @keyframes float-movement-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(40px, -40px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        .animate-float-slow {
          animation: float-movement-slow 20s infinite;
        }
        
        @keyframes float-movement-reverse {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-40px, 30px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        .animate-float-reverse {
          animation: float-movement-reverse 25s infinite;
        }
        
        @keyframes float-small {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        
        .animate-float-small {
          animation: float-small 5s infinite;
        }
        
        @keyframes float-small-reverse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-10deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        
        .animate-float-small-reverse {
          animation: float-small-reverse 6s infinite;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-10px) translateX(-50%); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </section>
  );
}
