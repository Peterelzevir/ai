/**
 * Web Speech API utilities for speech-to-text and text-to-speech
 */

// Speech Recognition (Speech-to-Text)
export const startSpeechRecognition = (onResult, onEnd) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in your browser. Try using Chrome or Edge.');
    onEnd();
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  let finalTranscript = '';

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
    onResult(interimTranscript, false);
    
    // If we have a final result, send it
    if (finalTranscript) {
      onResult(finalTranscript, true);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
};

// Text-to-Speech
export const speakText = (text) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      reject(new Error('Text-to-speech not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoice();
      };
    } else {
      setVoice();
    }
    
    function setVoice() {
      // Try to find a good English voice
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Google') || voice.name.includes('Premium')) && 
        voice.lang.includes('en')
      ) || voices.find(voice => voice.lang.includes('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Set speech properties
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error', error);
        reject(error);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  });
};