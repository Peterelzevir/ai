'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { useChatContext } from '@/context/ChatContext';
import { startSpeechRecognition, speakText } from '@/lib/voice';

export default function VoiceInput() {
  const { sendMessage, isProcessing } = useChatContext();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  
  // Use refs to prevent cleanup issues
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleStartListening = () => {
    if (isProcessing || isSpeaking || !isSupported) return;
    
    setError(null);
    setIsListening(true);
    setTranscript('');
    setFinalTranscript('');
    
    try {
      const onResultCallback = (text, isFinal) => {
        console.log("Speech recognition interim result:", text);
        setTranscript(text); // Always update the displayed transcript
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // If final result and meaningful text, save it as final
        if (isFinal) {
          console.log("Speech recognition final result:", text);
          setFinalTranscript(text);
        }
        
        // Set a timeout to stop listening if no new speech is detected
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            console.log("Speech timeout - stopping recognition");
            handleSendVoiceMessage(text);
            recognitionRef.current.stop();
          }
        }, 2000);
      };
      
      const onEndCallback = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        
        // Use the final transcript if available, otherwise use the last transcript
        const textToSend = finalTranscript || transcript;
        
        // If we have a meaningful message, send it
        if (textToSend && textToSend.trim().length > 2) {
          handleSendVoiceMessage(textToSend);
        }
      };
      
      recognitionRef.current = startSpeechRecognition(
        onResultCallback,
        onEndCallback
      );
      
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

  const handleStopListening = () => {
    console.log("Manually stopping speech recognition");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop(); // This will trigger onEnd event
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setIsListening(false);
      }
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSendVoiceMessage = async (text) => {
    if (!text || !text.trim() || isProcessing) return;
    
    const trimmedText = text.trim();
    console.log("Sending voice message:", trimmedText);
    
    try {
      // Send message to AI
      const response = await sendMessage(trimmedText);
      
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
    } catch (error) {
      console.error('Error sending voice message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Modern UI for unsupported browsers
  if (!isSupported) {
    return (
      <div className="flex flex-col space-y-3 p-4 bg-primary-700 rounded-lg border border-primary-400/20">
        <div className="flex items-center text-yellow-500">
          <FiAlertTriangle className="mr-2" />
          <span className="text-sm">Voice mode is not supported in this browser.</span>
        </div>
        <button
          onClick={() => document.querySelector('[title="Switch to Text Mode"]').click()}
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
            className="px-3 py-2 bg-primary-600 border border-primary-400/20 rounded-lg text-white text-sm shadow-inner"
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-primary-300">
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
                  ? 'bg-primary-600 text-primary-300 cursor-not-allowed'
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
