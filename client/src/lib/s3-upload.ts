interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  url?: string;
  imageUrl?: string;
}

interface ProcessImageResponse {
  audioUrl?: string;
  audio_url?: string;
  url?: string;
}

// Lambda function URL - use environment variable if available, fallback to hardcoded value
const LAMBDA_FUNCTION_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL || 
  "https://tzwjm77dveaxax2mlutjt5io6q0iegxp.lambda-url.us-east-1.on.aws/";

export async function getUploadUrl(): Promise<UploadUrlResponse> {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
  const uploadUrlEndpoint = `${LAMBDA_FUNCTION_URL}?action=upload-url&filename=${fileName}`;

  console.log("Requesting upload URL from:", uploadUrlEndpoint);

  const response = await fetch(uploadUrlEndpoint);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get upload URL: ${response.status} ${errorText}`,
    );
  }

  const responseData = await response.json();
  console.log("Upload URL response:", responseData);

  return {
    uploadUrl: responseData.uploadUrl,
    key: responseData.objectKey,
    imageUrl: responseData.objectUrl || responseData.url,
  };
}

export async function uploadToS3(blob: Blob, uploadUrl: string): Promise<void> {
  console.log("Uploading to S3 with URL:", uploadUrl);

  // S3 pre-signed URLs expect PUT requests with the file as the raw body
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

  console.log("S3 upload successful");
}

export async function processImage(
  imageKey: string,
): Promise<ProcessImageResponse> {
  const processEndpoint = `${LAMBDA_FUNCTION_URL}?action=process`;

  console.log("Processing image with key:", imageKey);
  console.log("Process endpoint:", processEndpoint);

  // Call Lambda function directly to process the image
  const response = await fetch(processEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_key: imageKey }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to process image: ${response.status} ${errorText}`);
  }

  const responseData = await response.json();
  console.log("Process response:", responseData);

  return responseData;
}

export async function uploadAndProcess(blob: Blob): Promise<string> {
  try {
    console.log("Starting upload and process flow");

    // 1. Get a pre-signed URL for uploading to S3
    const { uploadUrl, key } = await getUploadUrl();
    console.log("Received upload URL:", uploadUrl);
    console.log("Image key:", key);

    // 2. Upload the image to S3 using the pre-signed URL
    await uploadToS3(blob, uploadUrl);
    console.log("Successfully uploaded to S3");

    // 3. Process the image through the Lambda function
    const response = await processImage(key);

    // Handle different possible response formats
    const audioUrl = response.audioUrl || response.audio_url || response.url;
    console.log("Received audio URL:", audioUrl);

    if (!audioUrl) {
      throw new Error("No audio URL returned from processing");
    }

    return audioUrl;
  } catch (error) {
    console.error("Error in uploadAndProcess:", error);
    throw error;
  }
}
