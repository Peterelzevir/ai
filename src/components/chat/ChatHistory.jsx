'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function ChatHistory({ messages, isProcessing }) {
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
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            ref={isLastMessage ? lastMessageRef : null}
          >
            <div className={`max-w-[80%] md:max-w-[70%] flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              {/* Avatar - only show for assistant */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white text-xs">
                  AI
                </div>
              )}
              
              {/* Message content */}
              <div>
                <div 
                  className={`
                    px-4 py-3 rounded-2xl chat-bubble-appear
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
                <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start"
        >
          <div className="max-w-[80%] flex flex-row items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white text-xs">
              AI
            </div>
            <div className="px-4 py-3 rounded-2xl bg-dark-800 text-white border border-white/10 rounded-tl-none">
              <div className="typing-animation">
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