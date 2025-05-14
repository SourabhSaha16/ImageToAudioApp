import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>How to Use</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="flex items-start">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
              <i className="ri-camera-line text-primary"></i>
            </div>
            <div>
              <h4 className="font-medium">Take a Photo</h4>
              <p className="text-sm text-gray-600">Point your camera at something interesting and tap the capture button</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
              <i className="ri-upload-cloud-line text-primary"></i>
            </div>
            <div>
              <h4 className="font-medium">Processing</h4>
              <p className="text-sm text-gray-600">Your photo will be analyzed and converted to audio</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
              <i className="ri-play-circle-line text-primary"></i>
            </div>
            <div>
              <h4 className="font-medium">Listen</h4>
              <p className="text-sm text-gray-600">Play the audio to hear what your image sounds like</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
