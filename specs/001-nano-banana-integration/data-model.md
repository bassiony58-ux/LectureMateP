# Data Model: Nano Banana Integration

## 1. Firestore Data Adjustments

Given we are using Firebase (Firestore and Storage):

### Generation Request Document (e.g. `generations` collection)
Fields added/modified to accommodate Nano Banana:
- `engine` (string): e.g. "nano_banana" or "gemini"
- `status` (string): e.g. "pending_video", "generating_ppt", "completed", "failed"
- `nano_banana_job_id` (string): ID from the 3rd party API (optional, for async polling)
- `generated_video_url` (string): URL for the completed video in Firebase Storage.
- `generated_ppt_url` (string): URL for the completed PowerPoint.
- `generated_assets` (array of strings): URLs pointing to images generated.

### Uploaded File Reference (e.g. `uploads` or embedded in `generations`)
- Needs a reference to the source file stored in Firebase Storage, which will be passed to Nano Banana for the video summary task.
