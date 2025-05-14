# Photo to Audio Converter

A mobile-friendly web application that allows users to capture photos with their device camera, which are then processed through AWS Lambda to generate audio files based on the image content.

## Features

- Take photos using your device camera
- Process images through AWS Lambda
- View and play generated audio
- Mobile-friendly, responsive design
- Works on iOS and Android devices

## Technologies Used

- React with TypeScript
- TailwindCSS for styling
- AWS Lambda for image processing
- S3 for image and audio storage
- Vite for building and bundling

## How to Use

1. Open the application on your mobile device
2. Grant camera permissions when prompted
3. Take a photo using the camera interface
4. Wait for processing (image upload and audio generation)
5. Listen to the audio generated from your image
6. Take another photo or share your result

## Developing Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This application is configured to be deployed on GitHub Pages. It can be deployed by pushing to the main branch, which will trigger a GitHub Actions workflow to build and deploy the app.

The application communicates directly with AWS Lambda functions for image processing, so no server-side code is needed for deployment.