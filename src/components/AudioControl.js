import React, { useRef, useEffect, useState } from 'react';

const AudioControl = ({ src }) => {
  const audioRef = useRef(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Function to start audio on user interaction
    const playAudio = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;  // Set volume to half
        audioRef.current.play()
          .then(() => {
            // Remove event listeners once the audio starts playing
            document.removeEventListener('click', playAudio);
            document.removeEventListener('keydown', playAudio);
            setAudioStarted(true);
          })
          .catch(err => console.error('Failed to play:', err));
      }
    };

    // Add event listeners to document to capture the first user interaction
    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, [src]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100 }}>
      {audioStarted && (
        <button onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      )}
    </div>
  );
};

export default AudioControl;
