import { apiRequest } from "./queryClient";

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  bucketUrl: string;
}

interface ProcessImageResponse {
  audioUrl: string;
}

export async function getUploadUrl(): Promise<UploadUrlResponse> {
  const response = await fetch("/api/get-upload-url");
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

export async function uploadToS3(blob: Blob, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to S3: ${response.status} ${errorText}`);
  }
}

export async function processImage(imageUrl: string): Promise<ProcessImageResponse> {
  const response = await apiRequest("POST", "/api/process-image", { imageUrl });
  return await response.json();
}

export async function uploadAndProcess(blob: Blob): Promise<string> {
  // Get a pre-signed URL for uploading to S3
  const { uploadUrl, bucketUrl } = await getUploadUrl();
  
  // Upload the image to S3 using the pre-signed URL
  await uploadToS3(blob, uploadUrl);
  
  // Process the image through the Lambda function
  const { audioUrl } = await processImage(bucketUrl);
  
  return audioUrl;
}
