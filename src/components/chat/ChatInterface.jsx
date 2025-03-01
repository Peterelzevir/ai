'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiShare2, FiMic, FiMessageSquare, FiMenu, FiX, FiMaximize, FiMinimize } from 'react-icons/fi';
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
  
  // States
  const [shareUrl, setShareUrl] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatContainerRef = useRef(null);

  // Check if we're on mobile & listen for resize
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
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  // Full screen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Handle sharing conversation
  const handleShare = async () => {
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

  // Chat container classes
  const containerClasses = `
    ${isFullScreen ? 'fixed inset-0 z-50' : 'relative'} 
    h-[calc(100vh-5rem)] flex flex-col rounded-xl overflow-hidden
    bg-primary-800 shadow-elevation
  `;

  return (
    <div className={containerClasses}>
      {/* Header with brand */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-primary-600 bg-primary-900">
        <div className="flex items-center">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden mr-3 text-primary-200 hover:text-primary-50"
            aria-label="Toggle sidebar"
          >
            {showSidebar ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          <div className="flex items-center">
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: 5 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-accent flex items-center justify-center text-white font-medium mr-2 md:mr-3 flex-shrink-0 overflow-hidden"
            >
              <Image 
                src="/images/avatar.svg" 
                alt="AI Peter" 
                width={36} 
                height={36} 
                className="w-full h-full"
              />
            </motion.div>
            <div className="overflow-hidden">
              <div className="text-primary-50 font-medium text-sm md:text-base truncate">AI Peter</div>
              <div className="text-xs text-primary-300 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span> Online
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleVoiceMode}
            className={`p-2 rounded-md ${
              isVoiceMode ? 'bg-accent text-white' : 'text-primary-200 hover:bg-primary-700 hover:text-primary-50'
            } transition-colors`}
            title={isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          >
            {isVoiceMode ? <FiMessageSquare size={18} /> : <FiMic size={18} />}
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-md text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
            title="Share Conversation"
            disabled={messages.length < 2}
          >
            <FiShare2 size={18} />
          </button>
          
          <button
            onClick={clearConversation}
            className="p-2 rounded-md text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
            title="New Conversation"
          >
            <FiRefreshCw size={18} />
          </button>
          
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-md text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors hidden md:block"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (mobile only) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '75%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="md:hidden absolute inset-y-0 left-0 z-10 bg-primary-900 border-r border-primary-600 overflow-y-auto"
              style={{ top: '60px' }}
            >
              <div className="p-4">
                <h2 className="text-lg font-medium text-primary-50 mb-4">Conversations</h2>
                <button
                  onClick={() => {
                    clearConversation();
                    setShowSidebar(false);
                  }}
                  className="w-full py-2 px-3 rounded bg-accent text-white text-sm mb-4"
                >
                  New Chat
                </button>
                
                <div className="space-y-2 text-primary-200">
                  <div className="p-3 rounded-md hover:bg-primary-700 cursor-pointer">
                    <div className="text-sm font-medium">Current Chat</div>
                    <div className="text-xs text-primary-300 truncate mt-1">
                      {messages.length > 1 
                        ? messages[1]?.content?.substring(0, 40) + "..." 
                        : "Start typing to chat with AI Peter..."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Chat history */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-primary-700"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md px-4 py-8 rounded-lg bg-primary-800/50">
                <Image
                  src="/images/avatar.svg"
                  alt="AI Peter"
                  width={64}
                  height={64}
                  className="mx-auto mb-6 opacity-90"
                />
                <h3 className="text-xl text-primary-50 mb-3">Welcome to AI Peter</h3>
                <p className="mb-6 text-primary-200">
                  Start by sending a message and I'll respond in real-time with insightful answers.
                </p>
                
                <div className="flex flex-col gap-3 text-sm text-primary-300">
                  <div className="p-3 rounded-md bg-primary-800/70 hover:bg-primary-800 cursor-pointer text-left">
                    "What can you help me with today?"
                  </div>
                  <div className="p-3 rounded-md bg-primary-800/70 hover:bg-primary-800 cursor-pointer text-left">
                    "Tell me a story about artificial intelligence."
                  </div>
                  <div className="p-3 rounded-md bg-primary-800/70 hover:bg-primary-800 cursor-pointer text-left">
                    "What's the difference between machine learning and AI?"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatHistory messages={messages} isProcessing={isProcessing} isMobile={isMobile} />
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-primary-600 p-3 md:p-4 bg-primary-800">
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
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-accent text-white rounded-md shadow-lg text-sm"
          >
            Conversation link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
