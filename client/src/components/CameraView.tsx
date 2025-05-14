import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapturePhoto: () => void;
  onSwitchCamera: () => void;
  onCancel: () => void;
}

export function CameraView({ videoRef, onCapturePhoto, onSwitchCamera, onCancel }: CameraViewProps) {
  const focusIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showFocusAnimation = () => {
      if (!focusIndicatorRef.current) return;
      
      const focusIndicator = focusIndicatorRef.current;
      focusIndicator.classList.remove("opacity-0");
      focusIndicator.classList.add("opacity-100");
      
      setTimeout(() => {
        focusIndicator.classList.remove("opacity-100");
        focusIndicator.classList.add("opacity-0");
      }, 300);
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("click", showFocusAnimation);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("click", showFocusAnimation);
      }
    };
  }, [videoRef]);

  return (
    <div className="absolute inset-0 flex flex-col bg-black z-10">
      {/* Camera Viewfinder */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
        ></video>
        <div
          ref={focusIndicatorRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300"
        >
          <div className="w-24 h-24 border-2 border-white rounded-full"></div>
        </div>
      </div>
      
      {/* Camera Controls */}
      <div className="p-6 bg-black flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSwitchCamera}
          className="text-white p-3 rounded-full"
        >
          <i className="ri-refresh-line text-2xl"></i>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onCapturePhoto}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-0"
        >
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white p-3 rounded-full"
        >
          <i className="ri-close-line text-2xl"></i>
        </Button>
      </div>
    </div>
  );
}
