import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceSearch = ({ onSearch, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        
        // Send interim results to parent
        if (onTranscript) {
          onTranscript(transcriptResult);
        }
        
        if (event.results[current].isFinal) {
          onSearch(transcriptResult);
          setTranscript('');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
      };

      setRecognition(recognitionInstance);
    }
  }, [onSearch, onTranscript]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {isListening && (
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;