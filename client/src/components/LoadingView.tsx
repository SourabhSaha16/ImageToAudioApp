import React from "react";

export enum ProcessingStep {
  UPLOAD = "upload",
  PROCESS = "process",
  DOWNLOAD = "download"
}

interface ProcessingStatus {
  step: ProcessingStep;
  completed: boolean;
  active: boolean;
}

interface LoadingViewProps {
  status: string;
  detail: string;
  processingStatus: Record<ProcessingStep, ProcessingStatus>;
}

export function LoadingView({ status, detail, processingStatus }: LoadingViewProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
      <div className="flex flex-col items-center p-8">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        
        <h2 className="text-lg font-medium text-center mb-1">{status}</h2>
        <p className="text-sm text-gray-500 text-center">{detail}</p>
        
        {/* Progress Indicators */}
        <div className="w-full max-w-xs mt-6 space-y-2">
          <ProgressStep
            label="Uploading photo"
            completed={processingStatus.upload.completed}
            active={processingStatus.upload.active}
          />
          
          <ProgressStep
            label="Processing with AI"
            completed={processingStatus.process.completed}
            active={processingStatus.process.active}
          />
          
          <ProgressStep
            label="Preparing audio"
            completed={processingStatus.download.completed}
            active={processingStatus.download.active}
          />
        </div>
      </div>
    </div>
  );
}

interface ProgressStepProps {
  label: string;
  completed: boolean;
  active: boolean;
}

function ProgressStep({ label, completed, active }: ProgressStepProps) {
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 rounded-full flex items-center justify-center border border-gray-300 mr-3">
        {completed && <i className="ri-check-line text-success"></i>}
        {active && !completed && <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}
