import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (options = {}) => {
  const { lang = 'id-ID', onFinalTranscript, onError } = options;
  
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = lang;
      }
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setErrorMessage('');
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const handleStart = () => setIsListening(true);
    
    const handleEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    const handleResult = (event) => {
      let currentInterim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(currentInterim);
      
      if (finalTranscript && onFinalTranscript) {
        onFinalTranscript(finalTranscript);
      }
    };

    const handleError = (event) => {
      setIsListening(false);
      let msg = '';
      switch (event.error) {
        case 'not-allowed':
          msg = 'Izin mikrofon ditolak.';
          break;
        case 'no-speech':
          msg = 'Tidak ada suara.';
          break;
        case 'network':
          msg = 'Kesalahan jaringan.';
          break;
        default:
          msg = `Kesalahan: ${event.error}`;
      }
      setErrorMessage(msg);
      if (onError) onError(msg);
    };

    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('end', handleEnd);
    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);

    return () => {
      recognition.removeEventListener('start', handleStart);
      recognition.removeEventListener('end', handleEnd);
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
    };
  }, [onFinalTranscript, onError]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
      }
    };
  }, [isListening]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening
  };
};
