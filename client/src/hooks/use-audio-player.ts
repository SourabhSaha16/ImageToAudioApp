import { useState, useRef, useEffect } from "react";

interface UseAudioPlayerOptions {
  audioUrl: string | null;
  autoPlay?: boolean;
}

interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  progress: number;
  error: string | null;
  togglePlayPause: () => void;
  formatTime: (seconds: number) => string;
}

export function useAudioPlayer({ audioUrl, autoPlay = false }: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setError("Failed to play audio");
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    // Set audio source
    audio.src = audioUrl;
    audio.load();
    setIsLoading(true);
    setError(null);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio.play().catch(err => {
          console.error("Error auto-playing audio:", err);
          setError("Failed to auto-play audio");
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load audio file");
    };

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Cleanup event listeners
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl, autoPlay]);

  return {
    audioRef,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    progress,
    error,
    togglePlayPause,
    formatTime
  };
}
