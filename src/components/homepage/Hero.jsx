'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const fullText = "Experience the future of conversation.";
  
  useEffect(() => {
    // Show loading state first
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (inView && isLoaded) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypeText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 80);
      
      return () => clearInterval(typingInterval);
    }
  }, [inView, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg"
          >
            AI
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-accent/50 mx-auto mt-4 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/2 bg-accent rounded-full"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black" ref={ref}>
      {/* Background - simplified for better performance */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute w-full h-full">
          <Image
            src="/images/hero-bg.svg"
            alt="Background"
            fill
            priority={true}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center z-10 py-16">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-accent-light leading-tight"
          >
            AI Peter
            <span className="block text-xl md:text-2xl lg:text-3xl mt-2 text-white font-normal">
              Super Modern AI Chatbot
            </span>
          </motion.h1>

          <motion.div className="h-8 mb-10">
            <div className="text-md md:text-lg text-gray-300 font-mono inline-block border-r-2 border-accent overflow-hidden whitespace-nowrap">
              {typeText}
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-accent hover:bg-accent-light text-white rounded-full font-medium transition-all duration-300 text-lg"
              >
                Start Chatting Now
              </motion.button>
            </Link>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-transparent border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-all duration-300 text-lg"
              >
                Discover Features
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* AI Assistant Preview Image - Simplified for better performance */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative max-w-2xl mx-auto"
        >
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border border-white/10 shadow-lg glass">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-3 bg-black/80 rounded-lg max-w-md w-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-medium mr-3">
                    AI
                  </div>
                  <div>
                    <div className="text-white font-medium">AI Peter</div>
                    <div className="text-xs text-gray-400">Online now</div>
                  </div>
                </div>
                <div className="text-white">
                  Hello there! I'm Peter, your AI assistant. How can I help you today?
                </div>
              </div>
            </div>
            <div className="typing-animation absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 text-gray-400"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <path d="M7 13l5 5 5-5"></path>
              <path d="M7 6l5 5 5-5"></path>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
