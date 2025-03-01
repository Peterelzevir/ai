'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useChatContext } from '@/context/ChatContext';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, isProcessing } = useChatContext();
  const inputRef = useRef(null);

  // Focus the input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isProcessing) return;
    
    await sendMessage(message);
    setMessage('');
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle keyboard shortcut (Ctrl/Cmd + Enter)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-grow">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Type a message..."
          rows={1}
          className="w-full py-3 px-4 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
          style={{
            minHeight: '50px',
            maxHeight: '150px',
          }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray-500">
          {isProcessing ? 'Processing...' : 'Ctrl+Enter to send'}
        </div>
      </div>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!message.trim() || isProcessing}
        className={`
          p-3 rounded-full flex items-center justify-center transition-colors
          ${!message.trim() || isProcessing
            ? 'bg-dark-800 text-gray-500 cursor-not-allowed'
            : 'bg-accent text-white hover:bg-accent-light'
          }
        `}
      >
        <FiSend size={18} />
      </motion.button>
    </form>
  );
}