<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7ca17cf3-b2b7-45c0-a7ce-004de9d129b2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## API Server

The Express backend stores portal data in `server/data.json` and exposes the public portal and authenticated admin APIs.

1. Start the API server in a second terminal:
   `npm run server`
2. Start the frontend:
   `npm run dev`

The frontend proxies `/api` requests to `http://localhost:4000`. The first frontend startup seeds the backend from the existing portal data. Admin routes are `/admin/auth` and `/admin/dashboard`.
"# CU-Service-Directory" 
