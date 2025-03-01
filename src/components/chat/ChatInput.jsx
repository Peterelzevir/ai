'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useChatContext } from '@/context/ChatContext';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, isProcessing } = useChatContext();
  const inputRef = useRef(null);
  const [rows, setRows] = useState(1);

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
    setRows(1);
    
    // Re-focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Automatically adjust rows based on content
    const textareaLineHeight = 24; // approximate line height in pixels
    const minRows = 1;
    const maxRows = 5;
    
    const previousRows = e.target.rows;
    e.target.rows = minRows; // reset rows
    
    const currentRows = Math.floor(e.target.scrollHeight / textareaLineHeight);
    
    if (currentRows === previousRows) {
      e.target.rows = currentRows;
    }
    
    if (currentRows >= maxRows) {
      e.target.rows = maxRows;
      e.target.scrollTop = e.target.scrollHeight;
    }
    
    setRows(currentRows < maxRows ? currentRows : maxRows);
  };

  // Handle keyboard shortcut (Ctrl/Cmd + Enter)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="relative flex-grow">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Type a message..."
          rows={rows}
          className="w-full py-2 px-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all text-sm sm:text-base"
          style={{
            minHeight: '44px',
            maxHeight: '150px',
          }}
        />
        <div className="absolute right-2 bottom-1 text-[10px] text-gray-500">
          {isProcessing ? 'Processing...' : ''}
        </div>
      </div>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!message.trim() || isProcessing}
        className={`
          p-2 h-[44px] w-[44px] rounded-full flex items-center justify-center transition-colors
          ${!message.trim() || isProcessing
            ? 'bg-dark-800 text-gray-500 cursor-not-allowed'
            : 'bg-accent text-white hover:bg-accent-light'
          }
        `}
        aria-label="send message bro!"
      >
        <FiSend size={18} />
      </motion.button>
    </form>
  );
}
