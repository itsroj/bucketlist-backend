# Bucket List API

Backend service for the Bucket List application that provides API endpoints for user authentication, bucket list management, profile management, AI chatbot, and file upload functionality.

## Tech Stack

- **Node.js** with **Express**
- **TypeScript**
- **JWT** for authentication
- **Google Generative AI** (Gemini) for chatbot functionality
- **Cloudinary** for image storage

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the example.env template
5. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/verify` - Verify JWT token

### Bucket List

- `GET /api/bucket-list` - Get all bucket list entries
- `GET /api/bucket-list/:id` - Get a specific bucket list entry
- `POST /api/bucket-list` - Create a new bucket list entry
- `PUT /api/bucket-list/:id` - Update a bucket list entry
- `PATCH /api/bucket-list/:id/toggle` - Toggle completion status
- `DELETE /api/bucket-list/:id` - Delete a bucket list entry

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change password
- `DELETE /api/profile` - Delete account

### Chatbot

- `GET /api/chatbot/history` - Get chat history
- `POST /api/chatbot/message` - Send a message to the chatbot
- `DELETE /api/chatbot/history` - Clear chat history

### Upload

- `POST /api/upload/image` - Upload an image to Cloudinary

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── generated/       # Generated files
│   └── server.ts        # Entry point
├── .env                 # Environment variables (create this)
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Development

To start the development server with hot-reload:

```
npm run dev
```

To build the project:

```
npm run build
```

To start the production server:

```
npm start
```
