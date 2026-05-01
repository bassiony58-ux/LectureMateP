# Quickstart: Nano Banana Integration

## Local Environment Secrets

Add the Nano Banana API Key to your `.env` file in the root directory:
```env
NANO_BANANA_API_KEY="your-api-key-here"
```

## Running the Components

1. Start the React Frontend:
```bash
npm run dev
# Running via Vite usually on port 5173
```

2. Start the Backend API:
Ensure you are in the `/server` directory and run:
```bash
npm run dev
```

The backend server accesses the `NANO_BANANA_API_KEY` to authenticate requests for PPT generation, image generation, and video jobs.
