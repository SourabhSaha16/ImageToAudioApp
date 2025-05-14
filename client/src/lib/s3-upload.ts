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
  // For Lambda pre-signed URL upload, we may need to adjust the fetch request
  // S3 pre-signed URLs typically expect PUT requests with the file as the raw body
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
  // Send the uploaded image URL to our backend API, which will forward to Lambda
  const response = await apiRequest("POST", "/api/process-image", { imageUrl });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to process image: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

export async function uploadAndProcess(blob: Blob): Promise<string> {
  try {
    console.log("Starting upload and process flow");
    
    // 1. Get a pre-signed URL for uploading to S3
    const { uploadUrl, bucketUrl } = await getUploadUrl();
    console.log("Received upload URL:", uploadUrl);
    console.log("Bucket URL:", bucketUrl);
    
    // 2. Upload the image to S3 using the pre-signed URL
    await uploadToS3(blob, uploadUrl);
    console.log("Successfully uploaded to S3");
    
    // 3. Process the image through the Lambda function
    const { audioUrl } = await processImage(bucketUrl);
    console.log("Received audio URL:", audioUrl);
    
    return audioUrl;
  } catch (error) {
    console.error("Error in uploadAndProcess:", error);
    throw error;
  }
}
