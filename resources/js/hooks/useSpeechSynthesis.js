import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = (defaultLang = 'id-ID') => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text) => {
    if (!isSupported || isMuted || !text) return;

    window.speechSynthesis.cancel();

    // Hapus format markdown sederhana agar dibaca bersih
    const cleanText = text.replace(/[*_#`\[\]]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Prioritaskan suara indonesia
    const indoVoice = voices.find(v => v.lang === defaultLang) || voices.find(v => v.lang.includes('id'));
    if (indoVoice) utterance.voice = indoVoice;
    
    utterance.lang = defaultLang;
    utterance.rate = rate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isMuted, rate, voices, defaultLang]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) stop();
      return !prev;
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    isMuted,
    rate,
    speak,
    stop,
    toggleMute,
    setRate
  };
};
