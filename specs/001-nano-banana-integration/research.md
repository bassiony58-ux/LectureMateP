# Research: Nano Banana Integration

## 1. Nano Banana API Architecture
- **Decision**: Integrate "Nano Banana" via the backend Node.js server.
- **Rationale**: Keeps API keys secure on the backend, allows proper logging, billing (if applicable), and error handling without exposing credentials to the client. The frontend will communicate with our own Express backend.
- **Alternatives**: Client-side direct integration (rejected due to API key security risks and rate limiting).

## 2. Asynchronous Video Generation
- **Decision**: Trigger a background task/polling mechanism on the Node backend to handle long-running video generation requests via Nano Banana.
- **Rationale**: Video generation inherently takes time. The user should be able to upload a file, start the job, and get a success URL later.
- **Alternatives**: Blocking the HTTP request (rejected because the connection would time out).

## 3. Storage of Generated Assets
- **Decision**: Save generated PPT files, images, and videos directly to Firebase Storage before returning download URLs to the client.
- **Rationale**: The project relies heavily on Firebase Storage. Keeping asset URLs in Firestore and files in Firebase Storage ensures consistency.
- **Alternatives**: Sending base64 responses to the frontend (rejected because of large payload size for videos and PPT files).
