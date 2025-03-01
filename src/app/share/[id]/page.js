'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { getSharedConversation } from '@/lib/api';

export default function ChatPreviewPage() {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const conversationData = await getSharedConversation(conversationId);
        
        if (conversationData) {
          setMessages(conversationData);
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError('Failed to load the conversation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  // Format timestamp for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-black bg-white pt-16">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="flex items-center text-white hover:text-accent transition-colors">
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
            
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent text-white rounded-full text-sm flex items-center"
              >
                <FiMessageCircle className="mr-2" />
                Try AI Peter Now
              </motion.button>
            </Link>
          </div>
          
          {/* Shared Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-dark-900/50 border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Preview Header */}
            <div className="border-b border-white/10 p-4">
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
                  <h1 className="text-white font-medium">Shared AI Peter Conversation</h1>
                  <p className="text-xs text-gray-400">Read-only preview</p>
                </div>
              </div>
            </div>
            
            {/* Content area */}
            <div className="p-6 grid-background min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="ai-thinking">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center text-red-400 py-8">
                  <p className="mb-4 text-lg">{error}</p>
                  <p>This conversation may have expired or doesn't exist.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => {
                    const isUser = message.role === 'user';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
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
                                px-4 py-3 rounded-2xl
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-white/10 p-4 bg-dark-800">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  This is a read-only preview of a shared conversation
                </div>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-accent text-white rounded-full text-sm"
                  >
                    Start Your Own Chat
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}