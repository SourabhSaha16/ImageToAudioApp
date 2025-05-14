import React from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  audioUrl: string;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const {
    audioRef,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    progress,
    error,
    togglePlayPause,
    formatTime
  } = useAudioPlayer({ audioUrl });

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mx-auto w-full max-w-xs">
      <audio ref={audioRef} className="hidden"></audio>
      
      {/* Player Controls */}
      <div className="flex flex-col items-center">
        {/* Play Button */}
        <Button
          variant="default"
          size="icon"
          disabled={isLoading || !!error}
          onClick={togglePlayPause}
          className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mb-3 hover:bg-secondary transition shadow-md"
        >
          {isPlaying ? (
            <i className="ri-pause-fill text-2xl"></i>
          ) : (
            <i className="ri-play-fill text-2xl"></i>
          )}
        </Button>
        
        {/* Progress Bar */}
        <Progress value={progress} className="w-full h-2 mb-2" />
        
        {/* Time Display */}
        <div className="flex justify-between w-full text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
