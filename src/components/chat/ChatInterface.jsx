'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiShare2, FiMic, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import VoiceInput from './VoiceInput';
import { useChatContext } from '@/context/ChatContext';
import { saveConversationForSharing } from '@/lib/api';
import Image from 'next/image';

export default function ChatInterface() {
  const {
    messages,
    isProcessing,
    isVoiceMode,
    conversationId,
    clearConversation,
    toggleVoiceMode,
    generateShareableLink,
  } = useChatContext();
  
  const [shareUrl, setShareUrl] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatContainerRef = useRef(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleShare = async () => {
    // Save the conversation and generate a shareable link
    try {
      await saveConversationForSharing(conversationId, messages);
      const shareableLink = generateShareableLink();
      setShareUrl(shareableLink);
      
      // Show toast notification
      setShowShareToast(true);
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink)
        .catch(err => console.error('Failed to copy link:', err));
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowShareToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error sharing conversation:', error);
    }
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] flex flex-col rounded-xl overflow-hidden border border-white/10 bg-dark-900/50 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/10 bg-black">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center text-white font-medium mr-2 md:mr-3 flex-shrink-0"
          >
            <Image 
              src="/images/avatar.svg" 
              alt="AI Peter" 
              width={40} 
              height={40} 
              className="w-full h-full rounded-full"
            />
          </motion.div>
          <div className="overflow-hidden">
            <div className="text-white font-medium text-sm md:text-base truncate">AI Peter</div>
            <div className="text-xs text-gray-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span> Online
            </div>
          </div>
        </div>
        
        {/* Desktop control buttons */}
        <div className="hidden md:flex space-x-2">
          <button
            onClick={toggleVoiceMode}
            className={`p-2 rounded-full ${
              isVoiceMode ? 'bg-accent text-white' : 'bg-dark-800 text-white/70 hover:text-white'
            } transition-colors`}
            title={isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          >
            {isVoiceMode ? <FiMessageSquare size={18} /> : <FiMic size={18} />}
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-dark-800 text-white/70 hover:text-white transition-colors"
            title="Share Conversation"
            disabled={messages.length < 2}
          >
            <FiShare2 size={18} />
          </button>
          
          <button
            onClick={clearConversation}
            className="p-2 rounded-full bg-dark-800 text-white/70 hover:text-white transition-colors"
            title="New Conversation"
          >
            <FiRefreshCw size={18} />
          </button>
        </div>
        
        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full bg-dark-800 text-white/70"
          >
            {isMenuOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-white/10 bg-dark-800 overflow-hidden md:hidden"
          >
            <div className="p-3 flex justify-around">
              <button
                onClick={() => {
                  toggleVoiceMode();
                  setIsMenuOpen(false);
                }}
                className={`p-2 rounded-full flex flex-col items-center ${
                  isVoiceMode ? 'bg-accent text-white' : 'bg-dark-900 text-white/70'
                } transition-colors`}
              >
                {isVoiceMode ? <FiMessageSquare size={16} /> : <FiMic size={16} />}
                <span className="text-xs mt-1">{isVoiceMode ? "Text" : "Voice"}</span>
              </button>
              
              <button
                onClick={() => {
                  handleShare();
                  setIsMenuOpen(false);
                }}
                className="p-2 rounded-full flex flex-col items-center bg-dark-900 text-white/70"
                disabled={messages.length < 2}
              >
                <FiShare2 size={16} />
                <span className="text-xs mt-1">Share</span>
              </button>
              
              <button
                onClick={() => {
                  clearConversation();
                  setIsMenuOpen(false);
                }}
                className="p-2 rounded-full flex flex-col items-center bg-dark-900 text-white/70"
              >
                <FiRefreshCw size={16} />
                <span className="text-xs mt-1">New</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat History */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gradient-to-b from-black to-dark-900"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 px-4 py-4 rounded-lg bg-dark-800/50 max-w-md">
              <Image
                src="/images/avatar.svg"
                alt="AI Peter"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <h3 className="text-lg text-white mb-2">Welcome to AI Peter</h3>
              <p className="mb-4">
                Start by sending a message and I'll respond in real-time with insightful answers.
              </p>
              <p className="text-sm">
                You can use voice mode to speak with me directly.
              </p>
            </div>
          </div>
        ) : (
          <ChatHistory messages={messages} isProcessing={isProcessing} isMobile={isMobile} />
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-white/10 p-3 md:p-4 bg-black">
        {isVoiceMode ? (
          <VoiceInput />
        ) : (
          <ChatInput />
        )}
      </div>
      
      {/* Share Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-accent text-white rounded-lg shadow-glow text-sm"
          >
            Conversation link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
