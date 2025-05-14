import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PermissionModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onRetry: () => void;
}

export function PermissionModal({ isOpen, onCancel, onRetry }: PermissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Camera Permission Required</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            This app needs camera access to take photos. Please allow access in your browser settings.
          </p>
          
          <Alert variant="warning" className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4">
            <AlertDescription className="text-sm text-yellow-800">
              If you denied permission, you'll need to reset it in your browser settings.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onRetry} className="flex-1">
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
