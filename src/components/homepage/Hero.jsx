'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [typeText, setTypeText] = useState('');
  const fullText = "Experience the future of conversation.";
  
  useEffect(() => {
    if (inView) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypeText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 100);
      
      return () => clearInterval(typingInterval);
    }
  }, [inView]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden grid-background" ref={ref}>
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center z-10 py-16">
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          <motion.h1 
            variants={item}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-accent-light leading-tight"
          >
            AI Peter
            <span className="block text-xl md:text-2xl lg:text-3xl mt-2 text-white font-normal">
              Super Modern AI Chatbot
            </span>
          </motion.h1>

          <motion.div 
            variants={item} 
            className="h-8 mb-10"
          >
            <div className="text-md md:text-lg text-gray-300 font-mono inline-block border-r-2 border-accent overflow-hidden whitespace-nowrap">
              {typeText}
            </div>
          </motion.div>

          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
          >
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-accent hover:bg-accent-light text-white rounded-full font-medium transition-all duration-300 text-lg"
              >
                Start Chatting Now
              </motion.button>
            </Link>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-all duration-300 text-lg"
              >
                Discover Features
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* AI Assistant Preview Image */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="relative w-full h-96 rounded-lg overflow-hidden border border-white/10 shadow-glow-lg glass">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 py-3 bg-black/60 rounded-lg max-w-md">
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
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400"
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