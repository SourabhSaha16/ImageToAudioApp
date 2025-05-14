import React from "react";
import { Button } from "@/components/ui/button";

interface WelcomeViewProps {
  onStartCapture: () => void;
}

export function WelcomeView({ onStartCapture }: WelcomeViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-0">
      <div className="p-8 max-w-sm mx-auto text-center">
        {/* App Image */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-primary bg-opacity-10 flex items-center justify-center">
          <i className="ri-camera-line text-4xl text-primary"></i>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Photo to Audio</h1>
        <p className="text-gray-600 mb-8">Take a photo and instantly hear what it sounds like</p>
        
        <Button
          onClick={onStartCapture}
          className="w-full py-6 bg-primary hover:bg-secondary transition flex items-center justify-center"
        >
          <i className="ri-camera-line mr-2"></i>
          Take a Photo
        </Button>
        
        <p className="mt-4 text-sm text-gray-500">We'll need permission to use your camera</p>
      </div>
    </div>
  );
}
