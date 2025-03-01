'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ChatHistory({ messages, isProcessing, isMobile = false }) {
  const lastMessageRef = useRef(null);

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isUser = message.role === 'user';
        
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            ref={isLastMessage ? lastMessageRef : null}
          >
            <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              {/* Avatar - only show for assistant */}
              {!isUser && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white text-xs overflow-hidden">
                  <Image 
                    src="/images/avatar.svg" 
                    alt="AI" 
                    width={32} 
                    height={32} 
                    className="w-full h-full"
                  />
                </div>
              )}
              
              {/* Message content */}
              <div className={`${isMobile ? 'max-w-[calc(100%-32px)]' : ''}`}>
                <div 
                  className={`
                    px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base chat-bubble-appear
                    ${isUser 
                      ? 'bg-accent text-white rounded-tr-none' 
                      : message.isError
                        ? 'bg-red-500/20 text-white border border-red-500/40 rounded-tl-none'
                        : 'bg-dark-800 text-white border border-white/10 rounded-tl-none'
                    }
                  `}
                >
                  {message.content}
                </div>
                
                {/* Timestamp */}
                <div className={`text-[10px] sm:text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {formatDate(message.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {/* Processing indicator (typing animation) */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start"
        >
          <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[70%] flex flex-row items-start gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white text-xs overflow-hidden">
              <Image 
                src="/images/avatar.svg" 
                alt="AI" 
                width={32} 
                height={32} 
                className="w-full h-full"
              />
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-dark-800 text-white border border-white/10 rounded-tl-none">
              <div className="typing-animation flex items-center justify-center h-5">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
