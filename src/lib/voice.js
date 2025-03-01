/**
 * Web Speech API utilities for speech-to-text and text-to-speech
 * With enhanced compatibility for various browsers and devices
 */

// Speech Recognition (Speech-to-Text)
export const startSpeechRecognition = (onResult, onEnd) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition is not supported in this browser');
    onEnd();
    return null;
  }

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Set properties
    recognition.lang = 'en-US'; // Default to English
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let recognitionTimeout = null;

    // This event is triggered when speech is recognized
    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Send the interim transcript for real-time feedback
      onResult(interimTranscript || finalTranscript, false);
      
      // Reset timeout on new speech results
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
      }
      
      // Set timeout to stop listening if no new speech is detected
      recognitionTimeout = setTimeout(() => {
        if (finalTranscript || interimTranscript.length > 3) {
          // If we have meaningful text, send final result
          onResult(finalTranscript || interimTranscript, true);
        }
        recognition.stop();
      }, 2000);
      
      // If we have a final result, send it
      if (finalTranscript) {
        onResult(finalTranscript, true);
      }
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Error with speech recognition';
      
      switch(event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please check permissions.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found or microphone is busy.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'no-speech':
          errorMessage = 'No speech was detected.';
          break;
      }
      
      // Log the specific error
      console.error(errorMessage);
      
      // Clear any pending timeouts
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
      }
      
      onEnd();
    };

    recognition.onend = () => {
      // Clear any pending timeouts
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
      }
      
      // Notify that recognition has ended
      onEnd();
    };

    // Start listening
    recognition.start();
    
    return recognition;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    onEnd();
    return null;
  }
};

// Text-to-Speech with enhanced compatibility
export const speakText = (text) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech is not supported in your browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Split long text into smaller chunks (for better reliability)
    const chunkLength = 150;
    const chunks = [];
    
    if (text.length > chunkLength) {
      let startIndex = 0;
      
      while (startIndex < text.length) {
        // Find a good breakpoint (end of sentence or comma)
        let endIndex = Math.min(startIndex + chunkLength, text.length);
        let lastPeriod = text.lastIndexOf('.', endIndex);
        let lastComma = text.lastIndexOf(',', endIndex);
        let lastSpace = text.lastIndexOf(' ', endIndex);
        
        // If we found a good breakpoint within our chunk window
        if (lastPeriod !== -1 && lastPeriod > startIndex && lastPeriod < endIndex) {
          endIndex = lastPeriod + 1;
        } else if (lastComma !== -1 && lastComma > startIndex && lastComma < endIndex) {
          endIndex = lastComma + 1;
        } else if (lastSpace !== -1 && lastSpace > startIndex) {
          endIndex = lastSpace;
        }
        
        chunks.push(text.substring(startIndex, endIndex).trim());
        startIndex = endIndex;
      }
    } else {
      chunks.push(text);
    }
    
    let currentChunk = 0;
    const utterances = [];
    
    // Function to speak the next chunk
    const speakNextChunk = () => {
      if (currentChunk >= chunks.length) {
        resolve();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
      utterances.push(utterance);
      
      // Get available voices
      let voices = window.speechSynthesis.getVoices();
      
      // If voices aren't loaded yet, wait for them
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoice(utterance, voices);
          speakCurrentChunk(utterance);
        };
      } else {
        setVoice(utterance, voices);
        speakCurrentChunk(utterance);
      }
    };
    
    // Function to set voice properties and speak
    const speakCurrentChunk = (utterance) => {
      // Set speech properties
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        currentChunk++;
        speakNextChunk();
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        
        // Try to continue with next chunk on error
        currentChunk++;
        speakNextChunk();
      };
      
      window.speechSynthesis.speak(utterance);
    };
    
    // Function to select the best voice
    const setVoice = (utterance, voices) => {
      // Try to find a good English voice
      const preferredVoice = 
        // Try to find a premium/enhanced voice first
        voices.find(voice => 
          (voice.name.includes('Google') || 
           voice.name.includes('Premium') ||
           voice.name.includes('Enhanced')) && 
          voice.lang.includes('en')
        ) || 
        // Fall back to any English voice
        voices.find(voice => voice.lang.includes('en')) ||
        // Fall back to the default voice
        voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    };
    
    // Start speaking
    speakNextChunk();
  });
};
