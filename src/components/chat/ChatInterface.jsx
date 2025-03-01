import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Mic, MicOff, Send, AlertCircle, Loader, 
  Volume2, XCircle, Maximize, Minimize, Menu
} from 'lucide-react';
import { speakText, startSpeechRecognition } from '@/lib/voice';

const ImprovedChatInterface = () => {
  // States
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello there! I'm Peter, your AI assistant. How can I help you today?", role: 'assistant', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Refs
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
      
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Simulate sending a message
  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(async () => {
      // Generate a mock response
      const response = {
        id: Date.now() + 1,
        content: `I understand you said: "${content.trim()}". How can I assist you further with this?`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
      
      // If in voice mode, speak the response
      if (isVoiceMode) {
        setIsSpeaking(true);
        try {
          await speakText(response.content);
        } catch (error) {
          console.error('Speech synthesis error:', error);
          setError('Could not play audio response. Please check your audio settings.');
        } finally {
          setIsSpeaking(false);
        }
      }
      
      return response;
    }, 1500);
  };

  // Handle text input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isProcessing) return;
    sendMessage(inputText);
  };

  // Start voice recording
  const startVoiceRecording = () => {
    if (isProcessing || isSpeaking) return;
    
    setError(null);
    setIsListening(true);
    setTranscript('');
    
    try {
      // Handle speech recognition results
      const onResultCallback = (text, isFinal) => {
        setTranscript(text);
        
        // Reset silence detection timer on new speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Set silence detection - if no new speech for 3 seconds, process what we have
        silenceTimeoutRef.current = setTimeout(() => {
          if (text.trim().length > 2) {
            stopVoiceRecording();
          }
        }, 3000);
      };
      
      // Handle end of recognition
      const onEndCallback = () => {
        setIsListening(false);
        if (transcript && transcript.trim().length > 2) {
          sendMessage(transcript);
        }
      };
      
      // Start speech recognition
      recognitionRef.current = startSpeechRecognition(
        onResultCallback,
        onEndCallback
      );
      
      // Set maximum recording time (10 seconds)
      voiceTimeoutRef.current = setTimeout(() => {
        stopVoiceRecording();
      }, 10000);
      
      if (!recognitionRef.current) {
        setError("Speech recognition couldn't start. Please check browser permissions.");
        setIsListening(false);
      }
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(`Couldn't access microphone. ${err.message || 'Please check permissions.'}`);
      setIsListening(false);
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setIsListening(false);
      }
    }
    
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  // Toggle voice mode
  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isListening) {
      stopVoiceRecording();
    }
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'relative w-full'} flex flex-col h-[calc(100vh-4rem)] bg-primary-900 rounded-xl shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700 bg-primary-800">
        <div className="flex items-center">
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="mr-3 text-primary-300 hover:text-primary-50 p-2 rounded-md"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white overflow-hidden mr-3">
              <img src="/images/avatar.svg" alt="AI Peter" className="w-full h-full" />
            </div>
            <div>
              <div className="text-primary-50 font-medium">AI Peter</div>
              <div className="text-xs text-primary-300 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                Online
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceMode}
            className={`p-2 rounded-md transition-colors ${isVoiceMode ? 'bg-accent text-white' : 'text-primary-300 hover:text-primary-50'}`}
            title={isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          >
            {isVoiceMode ? <MessageSquare size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-md text-primary-300 hover:text-primary-50 transition-colors"
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary-700"
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[85%] md:max-w-[70%] rounded-xl p-4 
                ${message.role === 'user' 
                  ? 'bg-accent/20 text-primary-50' 
                  : 'bg-primary-800 text-primary-50'
                }
              `}
            >
              {message.role !== 'user' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white overflow-hidden mr-2">
                    <img src="/images/avatar.svg" alt="AI Peter" className="w-full h-full" />
                  </div>
                  <span className="text-xs font-medium text-primary-300">AI Peter</span>
                </div>
              )}
              
              <div className="text-sm leading-relaxed">{message.content}</div>
              
              <div className="mt-2 text-right">
                <span className="text-xs text-primary-400">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[85%] md:max-w-[70%] rounded-xl p-4 bg-primary-800 text-primary-50">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white overflow-hidden mr-2">
                  <img src="/images/avatar.svg" alt="AI Peter" className="w-full h-full" />
                </div>
                <span className="text-xs font-medium text-primary-300">AI Peter</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Voice Feedback Area */}
      <AnimatePresence>
        {isVoiceMode && (transcript || isListening || isSpeaking || error) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-primary-700 bg-primary-800 p-4"
          >
            {error && (
              <div className="flex items-center text-red-400 mb-2 text-sm">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}
            
            {transcript && (
              <div className="bg-primary-700 p-3 rounded-md text-primary-50 text-sm mb-2">
                {transcript}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-primary-300">
              {isListening && <span>Listening... (tap mic to stop)</span>}
              {isSpeaking && <span>Speaking...</span>}
              {!isListening && !isSpeaking && transcript && <span>Tap mic to speak again</span>}
              {!isListening && !isSpeaking && !transcript && !error && <span>Tap the microphone to speak</span>}
              
              {isSpeaking && (
                <div className="flex items-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Volume2 size={18} className="text-accent" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Area */}
      <div className="border-t border-primary-700 p-4 bg-primary-800">
        {isVoiceMode ? (
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing || isSpeaking}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all
                ${isListening 
                  ? 'bg-red-500 text-white' 
                  : isProcessing || isSpeaking
                    ? 'bg-primary-600 text-primary-300 cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-light'
                }
                ${isListening ? 'shadow-lg' : ''}
              `}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader size={24} />
                </motion.div>
              ) : isListening ? (
                <MicOff size={24} />
              ) : (
                <Mic size={24} />
              )}
            </motion.button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message AI Peter..."
              disabled={isProcessing}
              className="flex-grow py-3 px-4 bg-primary-700 border border-primary-600 rounded-lg text-primary-50 placeholder-primary-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className={`
                p-3 rounded-lg flex items-center justify-center transition-colors
                ${!inputText.trim() || isProcessing
                  ? 'bg-primary-600 text-primary-400 cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent-light'
                }
              `}
            >
              <Send size={20} />
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ImprovedChatInterface;
