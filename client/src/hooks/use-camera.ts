import { useState, useRef, useEffect, useCallback } from "react";

type FacingMode = "user" | "environment";

interface UseCameraOptions {
  initialFacingMode?: FacingMode;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  photo: Blob | null;
  photoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  facingMode: FacingMode;
  hasPermission: boolean | null;
  initCamera: () => Promise<void>;
  switchCamera: () => void;
  takePhoto: () => void;
  resetPhoto: () => void;
  cleanupCamera: () => void;
}

export function useCamera({ initialFacingMode = "environment" }: UseCameraOptions = {}): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
  }, [stream, photoUrl]);

  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  const initCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean up previous stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setHasPermission(true);
    } catch (err) {
      console.error("Camera initialization error:", err);
      
      if ((err as DOMException).name === "NotAllowedError") {
        setHasPermission(false);
        setError("Camera permission denied. Please enable camera access in your browser settings.");
      } else {
        setError(`Failed to initialize camera: ${(err as Error).message}`);
        setHasPermission(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !stream) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      // Flip the image horizontally if using front camera
      if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to capture photo");
          return;
        }
        
        if (photoUrl) {
          URL.revokeObjectURL(photoUrl);
        }
        
        const newPhotoUrl = URL.createObjectURL(blob);
        setPhoto(blob);
        setPhotoUrl(newPhotoUrl);
      }, "image/jpeg", 0.9);
    } catch (err) {
      console.error("Error taking photo:", err);
      setError(`Failed to take photo: ${(err as Error).message}`);
    }
  }, [stream, facingMode, photoUrl]);

  const resetPhoto = useCallback(() => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhoto(null);
    setPhotoUrl(null);
  }, [photoUrl]);

  return {
    videoRef,
    stream,
    photo,
    photoUrl,
    isLoading,
    error,
    facingMode,
    hasPermission,
    initCamera,
    switchCamera,
    takePhoto,
    resetPhoto,
    cleanupCamera
  };
}
