'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { useChatContext } from '@/context/ChatContext';
import { startSpeechRecognition, speakText } from '@/lib/voice';

export default function VoiceInput() {
  const { sendMessage, isProcessing } = useChatContext();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if browser supports speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isRecognitionSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
      const isSynthesisSupported = 'speechSynthesis' in window;
      setIsSupported(isRecognitionSupported && isSynthesisSupported);
    }
  }, []);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        speechRecognition.abort();
      }
    };
  }, [speechRecognition]);

  const handleStartListening = () => {
    if (isProcessing || isSpeaking || !isSupported) return;
    
    setError(null);
    setIsListening(true);
    setTranscript('');
    
    try {
      const recognition = startSpeechRecognition(
        // onResult callback
        (text, isFinal) => {
          setTranscript(text);
          
          // If final result and meaningful text, send it
          if (isFinal && text.trim().length > 0) {
            handleSendVoiceMessage(text);
          }
        },
        // onEnd callback
        () => {
          setIsListening(false);
          
          // If we have a transcript but speech ended without being "final",
          // still send the message if it's meaningful
          if (transcript.trim().length > 3) {
            handleSendVoiceMessage(transcript);
          }
        }
      );
      
      if (!recognition) {
        setError("Couldn't start speech recognition. Please try again.");
        setIsListening(false);
        return;
      }
      
      setSpeechRecognition(recognition);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(`Couldn't access microphone. ${err.message || 'Please check permissions.'}`);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (speechRecognition) {
      try {
        speechRecognition.abort();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
      setIsListening(false);
    }
  };

  const handleSendVoiceMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    
    // Stop listening while processing
    handleStopListening();
    
    // Send message to AI
    const response = await sendMessage(text);
    
    // If we have a response, speak it
    if (response && response.content) {
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
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col space-y-3 p-2 bg-dark-800/50 rounded-lg">
        <div className="flex items-center text-yellow-500">
          <FiAlertTriangle className="mr-2" />
          <span className="text-sm">Voice mode is not supported in this browser.</span>
        </div>
        <button
          onClick={() => document.querySelector('button[title="Switch to Text Mode"]').click()}
          className="py-2 px-4 bg-accent text-white rounded-md text-sm w-full"
        >
          Switch to Text Mode
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-white text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transcript display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-3 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm shadow-inner"
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {isListening 
            ? '🎤 Listening... Tap to stop'
            : isSpeaking
              ? '🔊 Speaking...'
              : isProcessing
                ? '⏳ Processing...'
                : '👉 Tap the microphone to speak'}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          {(isListening || isSpeaking) && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-accent'}`}
            />
          )}
          
          {/* Voice button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isProcessing || isSpeaking}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              ${isListening 
                ? 'bg-red-500 text-white' 
                : isProcessing || isSpeaking
                  ? 'bg-dark-800 text-gray-500 cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent-light'
              }
              ${isListening ? 'shadow-glow' : ''}
            `}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <FiLoader size={24} />
              </motion.div>
            ) : isListening ? (
              <FiMicOff size={24} />
            ) : (
              <FiMic size={24} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
