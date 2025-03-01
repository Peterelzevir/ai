'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiLoader } from 'react-icons/fi';
import { useChatContext } from '@/context/ChatContext';
import { startSpeechRecognition, speakText } from '@/lib/voice';

export default function VoiceInput() {
  const { sendMessage, isProcessing } = useChatContext();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        speechRecognition.abort();
      }
    };
  }, [speechRecognition]);

  const handleStartListening = () => {
    if (isProcessing || isSpeaking) return;
    
    setIsListening(true);
    setTranscript('');
    
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
        // still send the message
        if (transcript.trim().length > 0) {
          handleSendVoiceMessage(transcript);
        }
      }
    );
    
    setSpeechRecognition(recognition);
  };

  const handleStopListening = () => {
    if (speechRecognition) {
      speechRecognition.abort();
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
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Transcript display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white"
        >
          {transcript}
        </motion.div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isListening 
            ? 'Listening...'
            : isSpeaking
              ? 'Speaking...'
              : isProcessing
                ? 'Processing...'
                : 'Tap the microphone to speak'}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          {(isListening || isSpeaking) && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-accent'}`}
            />
          )}
          
          {/* Voice button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isProcessing || isSpeaking}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
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