import React from 'react';

const VoiceButton = ({ status, onClick, isMuted, onToggleMute }) => {
  const isListening = status === 'listening';
  
  const baseStyle = {
    padding: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45px',
    height: '45px',
    fontSize: '20px'
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'listening': return { backgroundColor: '#ef4444', color: 'white', animation: 'voicePulse 1.5s infinite' };
      case 'processing': return { backgroundColor: '#f59e0b', color: 'white' };
      case 'speaking': return { backgroundColor: '#10b981', color: 'white' };
      default: return { backgroundColor: 'var(--navy, #3b82f6)', color: 'white' };
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        type="button"
        onClick={onClick}
        style={{ ...baseStyle, ...getStatusStyle() }}
        aria-label={isListening ? 'Berhenti merekam' : 'Mulai bicara'}
        title={isListening ? 'Berhenti merekam' : 'Mulai bicara'}
      >
        {isListening ? '⏹️' : '🎤'}
      </button>

      <button 
        type="button"
        onClick={onToggleMute}
        style={{...baseStyle, backgroundColor: '#e5e7eb', color: '#374151', fontSize: '18px'}}
        aria-label={isMuted ? 'Nyalakan suara AI' : 'Matikan suara AI'}
        title={isMuted ? 'Nyalakan suara AI' : 'Matikan suara AI'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <style>{`
        @keyframes voicePulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default VoiceButton;
