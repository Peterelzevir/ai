'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';

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
    <div className="space-y-6">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isUser = message.role === 'user';
        
        return (
          <div
            key={message.id}
            ref={isLastMessage ? lastMessageRef : null}
            className="w-full"
          >
            {/* Message container with avatar */}
            <div className={`flex items-start gap-3 group px-1 ${isUser ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
                {isUser ? (
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-primary-50">
                    <FiUser size={14} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white overflow-hidden">
                    <Image 
                      src="/images/avatar.svg" 
                      alt="AI" 
                      width={28} 
                      height={28} 
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Message content */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 max-w-[85%]"
              >
                {/* Name */}
                <div className="text-xs font-medium mb-1 text-primary-300">
                  {isUser ? 'You' : 'AI Peter'}
                </div>
                
                {/* Message bubble */}
                <div 
                  className={`
                    rounded-lg whitespace-pre-wrap text-sm leading-6
                    ${isUser 
                      ? 'bg-accent/10 text-primary-50' 
                      : message.isError
                        ? 'bg-red-500/10 text-primary-50 border border-red-500/30'
                        : 'bg-primary-800 text-primary-50'
                    }
                    px-4 py-3
                  `}
                >
                  {message.content}
                </div>
                
                {/* Bottom info bar with timestamp */}
                <div className="flex items-center mt-1 text-[10px] text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{formatDate(message.timestamp)}</span>
                </div>
              </motion.div>
            </div>
          </div>
        );
      })}
      
      {/* Processing indicator (typing animation) */}
      {isProcessing && (
        <div className="w-full">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 mr-2">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white overflow-hidden">
                <Image 
                  src="/images/avatar.svg" 
                  alt="AI" 
                  width={28} 
                  height={28} 
                  className="w-full h-full"
                />
              </div>
            </div>
            
            {/* Typing indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <div className="text-xs font-medium mb-1 text-primary-300">
                AI Peter
              </div>
              
              <div className="flex items-center bg-primary-800 rounded-lg px-4 py-3 h-10">
                <div className="typing-animation flex">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
