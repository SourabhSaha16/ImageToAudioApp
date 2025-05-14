import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { photoProcessSchema, audioResponseSchema } from "@shared/schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize AWS S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  // Get S3 presigned URL for direct upload
  app.get("/api/get-upload-url", async (req, res) => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
      const key = `uploads/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || "photo-to-audio-bucket",
        Key: key,
        ContentType: "image/jpeg",
      });
      
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      
      res.json({ 
        uploadUrl: signedUrl,
        key: key,
        bucketUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
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
      
      // Call AWS Lambda function
      const lambdaResponse = await fetch(process.env.LAMBDA_FUNCTION_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: validatedData.imageUrl }),
      });
      
      if (!lambdaResponse.ok) {
        throw new Error(`Lambda function returned ${lambdaResponse.status}`);
      }
      
      const responseData = await lambdaResponse.json();
      const validatedResponse = audioResponseSchema.parse(responseData);
      
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
