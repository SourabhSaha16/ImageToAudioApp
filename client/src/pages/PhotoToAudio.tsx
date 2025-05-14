import React, { useState, useCallback } from "react";
import { useCamera } from "@/hooks/use-camera";
import { uploadAndProcess } from "@/lib/s3-upload";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { WelcomeView } from "@/components/WelcomeView";
import { CameraView } from "@/components/CameraView";
import { PreviewView } from "@/components/PreviewView";
import { LoadingView, ProcessingStep } from "@/components/LoadingView";
import { AudioView } from "@/components/AudioView";
import { ErrorView } from "@/components/ErrorView";
import { HelpModal } from "@/components/HelpModal";
import { PermissionModal } from "@/components/PermissionModal";

type AppView = "welcome" | "camera" | "preview" | "loading" | "audio" | "error";

const defaultProcessingStatus = {
  [ProcessingStep.UPLOAD]: { step: ProcessingStep.UPLOAD, completed: false, active: false },
  [ProcessingStep.PROCESS]: { step: ProcessingStep.PROCESS, completed: false, active: false },
  [ProcessingStep.DOWNLOAD]: { step: ProcessingStep.DOWNLOAD, completed: false, active: false },
};

export default function PhotoToAudio() {
  const [activeView, setActiveView] = useState<AppView>("welcome");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("Something went wrong. Please try again.");
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Processing your image");
  const [loadingDetail, setLoadingDetail] = useState("This may take a few moments...");
  const [processingStatus, setProcessingStatus] = useState({...defaultProcessingStatus});
  
  const { toast } = useToast();
  
  const {
    videoRef,
    photo,
    photoUrl,
    error,
    facingMode,
    hasPermission,
    initCamera,
    switchCamera,
    takePhoto,
    resetPhoto,
    cleanupCamera
  } = useCamera();

  const resetProcessingState = useCallback(() => {
    setProcessingStatus({...defaultProcessingStatus});
    setLoadingStatus("Processing your image");
    setLoadingDetail("This may take a few moments...");
  }, []);

  const handleStartCapture = useCallback(async () => {
    try {
      await initCamera();
      setActiveView("camera");
    } catch (err) {
      console.error("Failed to initialize camera:", err);
      setIsPermissionModalOpen(true);
    }
  }, [initCamera]);

  const handleCapturePhoto = useCallback(() => {
    takePhoto();
    setActiveView("preview");
  }, [takePhoto]);

  const handleRetakePhoto = useCallback(() => {
    resetPhoto();
    setActiveView("camera");
  }, [resetPhoto]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!photo) return;
    
    try {
      setActiveView("loading");
      resetProcessingState();
      
      // Upload phase
      setProcessingStatus(prev => ({
        ...prev,
        [ProcessingStep.UPLOAD]: { ...prev[ProcessingStep.UPLOAD], active: true }
      }));
      setLoadingStatus("Uploading your image");
      setLoadingDetail("This may take a moment...");
      
      // Process phase (after waiting a bit to show progress)
      setTimeout(() => {
        setProcessingStatus(prev => ({
          ...prev,
          [ProcessingStep.UPLOAD]: { ...prev[ProcessingStep.UPLOAD], active: false, completed: true },
          [ProcessingStep.PROCESS]: { ...prev[ProcessingStep.PROCESS], active: true }
        }));
        setLoadingStatus("Processing with AI");
        setLoadingDetail("Analyzing your photo...");
      }, 2000);
      
      // Download phase (after waiting to simulate processing)
      setTimeout(async () => {
        try {
          setProcessingStatus(prev => ({
            ...prev,
            [ProcessingStep.PROCESS]: { ...prev[ProcessingStep.PROCESS], active: false, completed: true },
            [ProcessingStep.DOWNLOAD]: { ...prev[ProcessingStep.DOWNLOAD], active: true }
          }));
          setLoadingStatus("Preparing audio");
          setLoadingDetail("Almost there...");
          
          // Actually perform the upload and processing
          const result = await uploadAndProcess(photo);
          
          // Set the audio URL from the response
          setAudioUrl(result);
          
          // Mark download as complete
          setProcessingStatus(prev => ({
            ...prev,
            [ProcessingStep.DOWNLOAD]: { ...prev[ProcessingStep.DOWNLOAD], active: false, completed: true }
          }));
          
          // Switch to audio view
          setActiveView("audio");
        } catch (err) {
          console.error("Error processing image:", err);
          setErrorMessage("Failed to process your image. Please try again.");
          setActiveView("error");
        }
      }, 4000);
    } catch (err) {
      console.error("Error confirming photo:", err);
      setErrorMessage("Failed to upload your image. Please check your internet connection and try again.");
      setActiveView("error");
    }
  }, [photo, resetProcessingState]);

  const handleNewPhoto = useCallback(() => {
    resetPhoto();
    setAudioUrl(null);
    handleStartCapture();
  }, [resetPhoto, handleStartCapture]);

  const handleShare = useCallback(() => {
    if (!audioUrl) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Audio from Photo',
        text: 'Listen to what my image sounds like!',
        url: window.location.href
      }).catch(error => {
        console.log('Sharing failed', error);
        toast({
          title: "Sharing failed",
          description: "Unable to share the audio at this time.",
          variant: "destructive"
        });
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Web Share API not supported in your browser",
        variant: "destructive"
      });
    }
  }, [audioUrl, toast]);

  const handleTryAgain = useCallback(() => {
    resetProcessingState();
    resetPhoto();
    setActiveView("camera");
  }, [resetProcessingState, resetPhoto]);

  const handleCancelCapture = useCallback(() => {
    cleanupCamera();
    setActiveView("welcome");
  }, [cleanupCamera]);

  const handleRetryPermission = useCallback(() => {
    setIsPermissionModalOpen(false);
    handleStartCapture();
  }, [handleStartCapture]);

  return (
    <div className="h-full w-full flex justify-center items-center bg-gray-50">
      <div className="relative h-full w-full max-w-md mx-auto bg-white shadow-lg overflow-hidden flex flex-col">
        <Header onHelpClick={() => setIsHelpModalOpen(true)} />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Views */}
          {activeView === "welcome" && (
            <WelcomeView onStartCapture={handleStartCapture} />
          )}
          
          {activeView === "camera" && (
            <CameraView
              videoRef={videoRef}
              onCapturePhoto={handleCapturePhoto}
              onSwitchCamera={switchCamera}
              onCancel={handleCancelCapture}
            />
          )}
          
          {activeView === "preview" && photoUrl && (
            <PreviewView
              photoUrl={photoUrl}
              onRetake={handleRetakePhoto}
              onConfirm={handleConfirmPhoto}
            />
          )}
          
          {activeView === "loading" && (
            <LoadingView
              status={loadingStatus}
              detail={loadingDetail}
              processingStatus={processingStatus}
            />
          )}
          
          {activeView === "audio" && photoUrl && audioUrl && (
            <AudioView
              photoUrl={photoUrl}
              audioUrl={audioUrl}
              onNewPhoto={handleNewPhoto}
              onShare={handleShare}
            />
          )}
          
          {activeView === "error" && (
            <ErrorView
              message={errorMessage}
              onTryAgain={handleTryAgain}
            />
          )}
        </main>
        
        {/* Modals */}
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
        
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onCancel={() => setIsPermissionModalOpen(false)}
          onRetry={handleRetryPermission}
        />
      </div>
    </div>
  );
}
