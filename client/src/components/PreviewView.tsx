import React from "react";
import { Button } from "@/components/ui/button";

interface PreviewViewProps {
  photoUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export function PreviewView({ photoUrl, onRetake, onConfirm }: PreviewViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col bg-black z-20">
      {/* Preview Image Container */}
      <div className="flex-1 relative">
        <img
          className="absolute inset-0 w-full h-full object-contain"
          src={photoUrl}
          alt="Captured photo"
        />
      </div>
      
      {/* Preview Controls */}
      <div className="p-6 bg-black flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onRetake}
          className="text-white px-4 py-2 rounded-lg border border-white"
        >
          Retake
        </Button>
        
        <Button
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
          onClick={onConfirm}
        >
          Use Photo
        </Button>
      </div>
    </div>
  );
}
