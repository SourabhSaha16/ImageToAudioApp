import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { photoProcessSchema, audioResponseSchema } from "@shared/schema";

// Lambda function URL from the environment
const LAMBDA_FUNCTION_URL = "https://tzwjm77dveaxax2mlutjt5io6q0iegxp.lambda-url.us-east-1.on.aws/";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get S3 presigned URL for direct upload using the Lambda function
  app.get("/api/get-upload-url", async (req, res) => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
      
      // Call the Lambda function to get upload URL
      const uploadUrlEndpoint = `${LAMBDA_FUNCTION_URL}?action=upload-url&filename=${fileName}`;
      const lambdaResponse = await fetch(uploadUrlEndpoint);
      
      if (!lambdaResponse.ok) {
        throw new Error(`Lambda function returned ${lambdaResponse.status}`);
      }
      
      const responseData = await lambdaResponse.json();
      
      res.json({ 
        uploadUrl: responseData.uploadUrl,
        key: responseData.key,
        bucketUrl: responseData.imageUrl || responseData.url || `${responseData.key}`
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Process image through Lambda function
  app.post("/api/process-image", async (req, res) => {
    try {
      const validatedData = photoProcessSchema.parse(req.body);
      
      // Extract the key from the imageUrl
      const urlParts = validatedData.imageUrl.split('/');
      const imageKey = urlParts.slice(urlParts.indexOf('uploads')).join('/');
      
      // Call AWS Lambda function to process the image
      const lambdaResponse = await fetch(`${LAMBDA_FUNCTION_URL}?action=process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_key: imageKey }),
      });
      
      if (!lambdaResponse.ok) {
        throw new Error(`Lambda function returned ${lambdaResponse.status}`);
      }
      
      const responseData = await lambdaResponse.json();
      
      // Transform the response to match our expected schema
      const audioResponse = {
        audioUrl: responseData.audioUrl || responseData.audio_url || responseData.url
      };
      
      const validatedResponse = audioResponseSchema.parse(audioResponse);
      
      res.json(validatedResponse);
    } catch (error) {
      console.error("Error processing image:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process image" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
