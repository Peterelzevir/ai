'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, FiShare2, FiMic, FiMessageSquare, FiMenu, 
  FiX, FiMaximize, FiMinimize, FiDownload, FiSettings, 
  FiSearch, FiInfo, FiSend, FiChevronDown
} from 'react-icons/fi';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import VoiceInput from './VoiceInput';
import ChatSidebar from './ChatSidebar';
import ChatExportModal from './ChatExportModal';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
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
  
  // UI States
  const [shareUrl, setShareUrl] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const chatContainerRef = useRef(null);
  const optionsRef = useRef(null);

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

  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  // Full screen toggle with improved behavior
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement;
      
      const requestFullScreen = 
        docEl.requestFullscreen || 
        docEl.mozRequestFullScreen || 
        docEl.webkitRequestFullScreen || 
        docEl.msRequestFullscreen;
        
      if (requestFullScreen) {
        requestFullScreen.call(docEl);
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
    setShowOptions(false);
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error sharing conversation:', error);
    }
  };

  // Toggle sidebar with improved animation
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Filter messages based on search
  const filteredMessages = searchQuery.trim() 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Chat container classes - fixed full screen mode
  const containerClasses = `
    ${isFullScreen ? 'fixed inset-0 z-50 h-screen' : 'relative h-[calc(100vh-5rem)]'} 
    flex flex-col rounded-xl overflow-hidden
    bg-primary-800 shadow-elevation
  `;

  return (
    <>
      {/* Chat Sidebar with improved animation */}
      <ChatSidebar 
        isOpen={showSidebar} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
      />
      
      <div className={containerClasses}>
        {/* Header with brand */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-primary-600 bg-primary-900">
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="mr-3 text-primary-200 hover:text-primary-50 p-2 rounded-md hover:bg-primary-700/50 transition-colors"
              aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
            >
              {showSidebar ? <FiX size={18} /> : <FiMenu size={18} />}
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
                  <span className="relative flex w-2 h-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearchBox(!showSearchBox)}
              className={`p-2 rounded-md ${
                showSearchBox ? 'bg-accent text-white' : 'text-primary-200 hover:bg-primary-700/50 hover:text-primary-50'
              } transition-colors hidden sm:block`}
              aria-label="Search messages"
            >
              <FiSearch size={18} />
            </button>
            
            {/* Theme Switch */}
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>
            
            {/* Voice/Text Toggle */}
            <button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-md ${
                isVoiceMode ? 'bg-accent text-white' : 'text-primary-200 hover:bg-primary-700/50 hover:text-primary-50'
              } transition-colors`}
              title={isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
            >
              {isVoiceMode ? <FiMessageSquare size={18} /> : <FiMic size={18} />}
            </button>
            
            {/* More Options Dropdown - Improved with animation */}
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-md text-primary-200 hover:bg-primary-700/50 hover:text-primary-50 transition-colors"
                aria-label="More options"
              >
                <FiSettings size={18} />
              </button>
              
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-primary-800 border border-primary-700 rounded-md shadow-lg z-50 w-52 overflow-hidden"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleShare}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
                      >
                        <FiShare2 size={16} className="mr-3 text-primary-400" />
                        Share Conversation
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowExportModal(true);
                          setShowOptions(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
                      >
                        <FiDownload size={16} className="mr-3 text-primary-400" />
                        Export/Import Chat
                      </button>
                      
                      <button
                        onClick={() => {
                          clearConversation();
                          setShowOptions(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
                      >
                        <FiRefreshCw size={16} className="mr-3 text-primary-400" />
                        New Conversation
                      </button>
                      
                      <button
                        onClick={toggleFullScreen}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
                      >
                        {isFullScreen ? (
                          <>
                            <FiMinimize size={16} className="mr-3 text-primary-400" />
                            Exit Full Screen
                          </>
                        ) : (
                          <>
                            <FiMaximize size={16} className="mr-3 text-primary-400" />
                            Full Screen
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowInfoPanel(!showInfoPanel);
                          setShowOptions(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-primary-200 hover:bg-primary-700 hover:text-primary-50 transition-colors"
                      >
                        <FiInfo size={16} className="mr-3 text-primary-400" />
                        About AI Peter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Search box with improved animation */}
        <AnimatePresence>
          {showSearchBox && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-primary-600 bg-primary-800 overflow-hidden"
            >
              <div className="p-3 flex items-center">
                <FiSearch size={18} className="text-primary-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in conversation..."
                  className="flex-grow bg-transparent border-none outline-none text-primary-50 placeholder-primary-400 text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary-400 hover:text-primary-200 p-1"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Info Panel with improved animation */}
          <AnimatePresence>
            {showInfoPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isMobile ? '100%' : '320px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`${isMobile ? 'absolute inset-0 z-20' : 'relative'} border-l border-primary-600 bg-primary-800/95 backdrop-blur-sm overflow-y-auto h-full`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-primary-50">About AI Peter</h3>
                    <button 
                      onClick={() => setShowInfoPanel(false)}
                      className="text-primary-400 hover:text-primary-200 p-1"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  <div className="mb-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-accent rounded-full mb-3 overflow-hidden">
                      <Image 
                        src="/images/avatar.svg" 
                        alt="AI Peter"
                        width={80}
                        height={80}
                        className="w-full h-full"
                      />
                    </div>
                    <h4 className="text-lg text-primary-50 font-medium">AI Peter</h4>
                    <p className="text-primary-300 text-sm">Super Modern AI Chatbot</p>
                  </div>
                  
                  <div className="space-y-5 text-sm text-primary-300">
                    <p>
                      AI Peter is a state-of-the-art AI assistant designed to provide helpful, accurate responses in a modern, intuitive interface.
                    </p>
                    <div>
                      <h5 className="text-primary-100 font-medium mb-2">Features:</h5>
                      <ul className="space-y-2">
                        {[
                          'Text & Voice interactions',
                          'Code syntax highlighting',
                          'Conversation sharing',
                          'Dark/Light mode',
                          'Export/Import chats'
                        ].map((feature, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-primary-100 font-medium mb-2">Tips:</h5>
                      <ul className="space-y-2">
                        {[
                          'Use voice mode for hands-free interaction',
                          'Share conversations with unique links',
                          'Export chats for safekeeping',
                          'Write code with triple backticks for syntax highlighting'
                        ].map((tip, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (0.1 * i) }}
                            className="flex items-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                            {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Chat history - modified for full width and proper text size */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-0 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-primary-700 hide-scrollbar"
          >
            {filteredMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                {searchQuery ? (
                  <div className="text-center px-6 py-8 rounded-lg bg-primary-800/50 max-w-md mx-4">
                    <FiSearch size={36} className="mx-auto mb-4 text-primary-400" />
                    <p className="text-primary-200 mb-2">No messages match your search</p>
                    <p className="text-primary-400 text-sm">Try different keywords</p>
                  </div>
                ) : (
                  <div className="text-center max-w-md px-6 py-8 rounded-lg bg-primary-800/50 mx-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0.5 }}
                      animate={{ scale: [0.9, 1.1, 1], opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <Image
                        src="/images/avatar.svg"
                        alt="AI Peter"
                        width={80}
                        height={80}
                        className="mx-auto mb-6 opacity-90"
                      />
                    </motion.div>
                    <h3 className="text-2xl text-primary-50 mb-3 font-medium">Welcome to AI Peter</h3>
                    <p className="mb-6 text-primary-200 text-sm sm:text-base">
                      Start by sending a message and I'll respond in real-time with insightful answers.
                    </p>
                    
                    <div className="flex flex-col gap-3 text-sm text-primary-300">
                      {[
                        "What can you help me with today?",
                        "Tell me a story about artificial intelligence.",
                        "What's the difference between machine learning and AI?"
                      ].map((prompt, i) => (
                        <motion.div 
                          key={i}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          className="p-3 rounded-md bg-primary-800/70 hover:bg-primary-800 cursor-pointer text-left transition-all hover:translate-x-1"
                        >
                          {prompt}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 sm:px-4">
                <ChatHistory 
                  messages={filteredMessages} 
                  isProcessing={isProcessing} 
                  isMobile={isMobile} 
                  searchQuery={searchQuery}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Input Area - Full width */}
        <div className="border-t border-primary-600 p-2 sm:p-3 bg-primary-800">
          {isVoiceMode ? (
            <VoiceInput />
          ) : (
            <ChatInput />
          )}
          
          {/* Mobile only bottom controls */}
          {isMobile && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-between items-center mt-2 pt-2 border-t border-primary-600/50"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearchBox(!showSearchBox)}
                  className={`p-2 rounded-md ${
                    showSearchBox ? 'bg-accent text-white' : 'text-primary-300'
                  } transition-colors`}
                >
                  <FiSearch size={18} />
                </button>
                <ThemeSwitch />
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullScreen}
                className="text-primary-300 hover:text-primary-200 p-2"
              >
                {isFullScreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
              </motion.button>
            </motion.div>
          )}
        </div>
        
        {/* Share Toast Notification - Improved */}
        <AnimatePresence>
          {showShareToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="fixed bottom-10 left-1/2 transform -translate-x-1/2 px-5 py-3 bg-accent text-white rounded-lg shadow-xl flex items-center text-sm z-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
              Conversation link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Export/Import Modal */}
      <ChatExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      
      {/* Custom styles */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* For chat bubbles/messages that should be smaller */
        .chat-message {
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        /* Improve fullscreen mode */
        :fullscreen {
          background-color: #1e293b; /* primary-900 */
        }
        
        /* For shadow on the chat container */
        .shadow-elevation {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        @media (max-width: 640px) {
          .chat-message {
            font-size: 0.925rem;
          }
        }
      `}</style>
    </>
  );
}
