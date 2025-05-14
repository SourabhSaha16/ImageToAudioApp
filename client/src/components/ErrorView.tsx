import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  message: string;
  onTryAgain: () => void;
}

export function ErrorView({ message, onTryAgain }: ErrorViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="p-8 max-w-xs mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-3xl text-error"></i>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <Button
          onClick={onTryAgain}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
