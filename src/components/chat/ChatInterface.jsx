'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiShare2, FiMic, FiMessageSquare } from 'react-icons/fi';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import VoiceInput from './VoiceInput';
import { useChatContext } from '@/context/ChatContext';
import { saveConversationForSharing } from '@/lib/api';

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
  const chatContainerRef = useRef(null);

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
    <div className="relative h-[calc(100vh-10rem)] flex flex-col rounded-xl overflow-hidden border border-white/10 bg-dark-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-medium mr-3"
          >
            AI
          </motion.div>
          <div>
            <div className="text-white font-medium">AI Peter</div>
            <div className="text-xs text-gray-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span> Online
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
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
      </div>
      
      {/* Chat History */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 grid-background"
      >
        <ChatHistory messages={messages} isProcessing={isProcessing} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-white/10 p-4 bg-dark-800/80">
        {isVoiceMode ? (
          <VoiceInput />
        ) : (
          <ChatInput />
        )}
      </div>
      
      {/* Share Toast Notification */}
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
    </div>
  );
}