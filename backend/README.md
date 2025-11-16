# WePaste Backend API

WePaste backend - A Pastebin + FileShare service built with Node.js, Express, and MongoDB.

## Features

- Upload unlimited text content
- Upload multiple images (up to 20, 10MB each)
- Upload multiple files (up to 20, 10MB each)
- Generate random keys for content access
- Auto-expiration after 2 hours
- File storage using MongoDB GridFS
- Rate limiting and security middleware

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **GridFS** - File storage system
- **Multer** - File upload middleware
- **nanoid** - Random key generator
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your MongoDB Atlas connection string:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wepaste?retryWrites=true&w=majority
   GRIDFS_BUCKET_NAME=uploads
   FRONTEND_URL=http://localhost:3000
   ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:5000` (or port specified in `.env`)

## API Endpoints

### 1. Create Content
**POST** `/api/createContent`

Creates new content (text, images, files) and returns a random key.

**Request:**
- `Content-Type: multipart/form-data`
- Body:
  - `text` (string, optional): Text content
  - `images` (file[], optional): Image files (max 20, 10MB each)
  - `files` (file[], optional): File uploads (max 20, 10MB each)

**Response:**
```json
{
  "success": true,
  "data": {
    "randomKey": "abc123xyz",
    "expireIn": "2 hours"
  }
}
```

### 2. Read Content
**GET** `/api/readContent/:randomKey`

Retrieves content by random key.

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Your text content",
    "images": [
      {
        "id": "fileId",
        "name": "image.jpg",
        "type": "image/jpeg",
        "url": "/api/download/fileId"
      }
    ],
    "files": [
      {
        "id": "fileId",
        "name": "document.pdf",
        "type": "application/pdf",
        "url": "/api/download/fileId"
      }
    ]
  }
}
```

### 3. Download File
**GET** `/api/download/:fileId`

Downloads a file from GridFS.

### 4. Delete Content
**DELETE** `/api/delete/:randomKey`

Deletes content by random key (only valid within 2 hours).

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### 5. Health Check
**GET** `/health`

Returns server health status.

## Database Models

### Text
Stores text content with expiration time.

### ImageMeta
Stores metadata for uploaded images (references GridFS files).

### FileMeta
Stores metadata for uploaded files (references GridFS files).

### RandomKeys
Maps random keys to content items (text, images, files).

## Auto-Expiration

Content automatically expires after 2 hours using MongoDB TTL indexes. The TTL index is set on the `expiredAt` field in all models.

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Content Creation**: 50 requests per hour per IP

## File Validation

- **File Size**: Maximum 10MB per file
- **Image Types**: JPEG, JPG, PNG, GIF, WEBP, SVG
- **Blocked Types**: Executable files (.exe, .sh, etc.)

## Error Handling

All errors are handled by a global error handler middleware that returns consistent error responses.

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection & GridFS setup
├── controllers/
│   └── contentController.js # Content CRUD operations
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── upload.js            # Multer configuration
├── models/
│   ├── Text.js              # Text model
│   ├── ImageMeta.js         # Image metadata model
│   ├── FileMeta.js          # File metadata model
│   └── RandomKeys.js        # Random key mapping model
├── routes/
│   └── contentRoutes.js     # API routes
├── utils/
│   ├── gridfs.js            # GridFS helper functions
│   ├── keyGenerator.js      # Random key generation
│   └── fileValidator.js     # File validation utilities
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Express app entry point
```

## Testing with Postman

Import the provided `postman_collection.json` file into Postman to test all API endpoints.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- File type validation
- File size limits
- TTL indexes for auto-cleanup

## License

ISC

