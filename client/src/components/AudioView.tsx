import React from "react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./AudioPlayer";

interface AudioViewProps {
  photoUrl: string;
  audioUrl: string;
  onNewPhoto: () => void;
  onShare: () => void;
}

export function AudioView({ photoUrl, audioUrl, onNewPhoto, onShare }: AudioViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white z-40">
      <div className="flex-1 overflow-auto p-6 flex flex-col">
        {/* Result Summary */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Your Audio is Ready</h2>
          <p className="text-gray-500">Listen to what your image has to say</p>
        </div>
        
        {/* Thumbnail and Audio Player */}
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Thumbnail */}
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md mx-auto max-w-xs">
            <img
              className="w-full h-full object-cover"
              src={photoUrl}
              alt="Your image"
            />
          </div>
          
          {/* Audio Player */}
          <AudioPlayer audioUrl={audioUrl} />
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto pt-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onShare}
              className="flex items-center justify-center py-3 px-4 rounded-lg border border-gray-300 text-neutralDark hover:bg-gray-50 transition"
            >
              <i className="ri-share-line mr-2"></i>
              Share
            </Button>
            <Button
              onClick={onNewPhoto}
              className="flex items-center justify-center py-3 px-4 rounded-lg bg-primary text-white hover:bg-secondary transition"
            >
              <i className="ri-camera-line mr-2"></i>
              New Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
