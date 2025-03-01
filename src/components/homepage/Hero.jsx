'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

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
  
  // Enhanced loading animation
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => setIsLoaded(true), 300); // Reduced delay for faster loading
          return 100;
        }
        // More natural, non-linear loading progress
        const increment = Math.max(1, Math.floor(15 * Math.sin((prev / 100) * Math.PI)));
        return Math.min(100, prev + increment);
      });
    }, 50); // Faster intervals for smoother animation
    
    return () => clearInterval(loadingInterval);
  }, []);
  
  // Enhanced typing effect with cursor blink
  useEffect(() => {
    if (inView && isLoaded) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypeText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          // Add a blinking cursor at the end
          if (typingRef.current) {
            typingRef.current.classList.add('blinking-cursor');
          }
        }
      }, 60); // Slightly faster typing
      
      return () => clearInterval(typingInterval);
    }
  }, [inView, isLoaded, fullText]);

  // Loading Screen with enhanced animations
  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-primary-900 overflow-hidden">
        <div className="text-center max-w-md px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ 
              opacity: 1, 
              scale: [0.8, 1.1, 1],
              rotate: [-5, 5, 0] 
            }}
            transition={{ 
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: "easeOut" 
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center"
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
            className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-50 to-accent"
          >
            AI Peter
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-base text-primary-200 mb-8"
          >
            Loading your super modern chatbot experience...
          </motion.div>
          
          {/* Enhanced progress bar with glow effect */}
          <div className="w-full max-w-xs mx-auto bg-primary-800/50 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              className="h-full bg-gradient-to-r from-accent to-accent-light shadow-glow rounded-full"
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-primary-300 inline-flex items-center"
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
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-primary-900" ref={ref}>
      {/* Enhanced background with better animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated gradient background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-800"></div>
        
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-30"
          initial={{ backgroundPosition: '0% 0%' }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(0, 100, 255, 0.1), transparent 40%)'
          }}
        />
        
        <motion.div 
          className="absolute -top-1/4 -left-1/4 w-full h-full"
          animate={{ 
            x: [0, 40, 0], 
            y: [0, -40, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <div className="w-full h-full rounded-full bg-accent/5 blur-3xl"></div>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 w-full h-full"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <div className="w-full h-full rounded-full bg-accent/5 blur-3xl"></div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 text-center z-10 py-16 md:py-24">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="mb-6 md:mb-8 inline-block"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Image 
              src="/images/logo.svg" 
              alt="AI Peter Logo"
              width={120}
              height={120}
              className="mx-auto drop-shadow-glow"
            />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-50 via-accent-light to-accent leading-tight"
          >
            AI Peter
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="block text-xl md:text-3xl lg:text-4xl mt-4 text-primary-100 font-light"
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
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 120, 255, 0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl font-medium transition-all duration-300 text-lg shadow-glow"
              >
                Start Chatting Now
              </motion.button>
            </Link>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-primary-800/50 backdrop-blur-sm border border-primary-600/50 text-primary-50 rounded-xl font-medium hover:border-accent/50 transition-all duration-300 text-lg"
              >
                Discover Features
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Enhanced AI Assistant Preview with glass effect */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 relative max-w-3xl mx-auto"
        >
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-primary-600/30 shadow-xl bg-primary-800/40 backdrop-blur-lg">
            {/* Subtle glow effect on the edges */}
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
                  className="p-4 bg-primary-700/60 backdrop-blur-sm rounded-xl max-w-[80%]"
                >
                  <p className="text-primary-50">Hello there! I'm Peter, your AI assistant. How can I help you today?</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="ml-auto p-4 bg-accent/20 backdrop-blur-sm rounded-xl max-w-[80%]"
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
          
          {/* Decorative elements */}
          <motion.div
            className="absolute -bottom-5 -right-5 w-16 h-16 rounded-xl bg-accent/10 backdrop-blur-sm border border-accent/20 z-10"
            animate={{ rotate: [0, 10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute -top-5 -left-5 w-16 h-16 rounded-xl bg-primary-800/50 backdrop-blur-sm border border-primary-600/30 z-10"
            animate={{ rotate: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Enhanced scroll indicator */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-accent"
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
          </motion.div>
        </motion.div>
      </div>
      
      {/* Add custom CSS */}
      <style jsx global>{`
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
      `}</style>
    </section>
  );
}
