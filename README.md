# WePaste - Pastebin + FileShare Service

WePaste is a full-stack MERN application that combines pastebin functionality with file sharing capabilities. Users can upload unlimited text, multiple images, and multiple files, all accessible through a randomly generated key. All content automatically expires after 2 hours.

## 🌐 Live Demo

Experience WePaste in production: [https://wepaste.onrender.com](https://wepaste.onrender.com)

![WePaste](https://img.shields.io/badge/WePaste-v1.0.0-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)

## ✨ Features

- 📝 **Unlimited Text Upload** - Share any amount of text content
- 🖼️ **Multiple Images** - Upload up to 20 images (10MB each)
- 📎 **Multiple Files** - Upload up to 20 files (10MB each)
- 🔑 **Random Key Access** - Secure, randomly generated keys for content access
- ⏰ **Auto-Expiration** - Content automatically expires after 2 hours
- 🚀 **Fast & Secure** - Built with MongoDB GridFS for efficient file storage
- 🎨 **Modern UI** - Beautiful, responsive React frontend with Tailwind CSS

## 🛠️ Tech Stack

### Backend
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

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) installed
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (free tier works)
- **Git** installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WePaste
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp env.example.txt .env

# Edit .env file with your MongoDB Atlas connection string
# Replace username, password, and cluster URL
```

**Backend .env file structure:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wepaste?retryWrites=true&w=majority
GRIDFS_BUCKET_NAME=uploads
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults to http://localhost:5000/api)
# Copy env.example.txt to .env if you want to customize API URL
```

**Frontend .env file (optional):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run the Application

#### Start Backend Server

```bash
# From backend directory
npm run dev    # Development mode with auto-reload
# OR
npm start      # Production mode
```

Backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
npm start
```

Frontend will run on `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📁 Project Structure

```
WePaste/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   │   └── database.js     # MongoDB & GridFS setup
│   ├── controllers/        # Route controllers
│   │   └── contentController.js
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js
│   │   └── upload.js       # Multer configuration
│   ├── models/             # Mongoose models
│   │   ├── Text.js
│   │   ├── ImageMeta.js
│   │   ├── FileMeta.js
│   │   └── RandomKeys.js
│   ├── routes/             # API routes
│   │   └── contentRoutes.js
│   ├── utils/              # Utility functions
│   │   ├── gridfs.js       # GridFS helpers
│   │   ├── keyGenerator.js # nanoid wrapper
│   │   └── fileValidator.js
│   ├── .env                # Environment variables (create from env.example.txt)
│   ├── package.json
│   ├── server.js           # Express app entry point
│   └── README.md
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── UploadForm.jsx
│   │   │   ├── PreviewImage.jsx
│   │   │   └── FileDownload.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── UploadPage.jsx
│   │   │   └── ViewContentPage.jsx
│   │   ├── utils/          # Utilities
│   │   │   └── api.js      # API helper functions
│   │   ├── App.js          # Main App component
│   │   ├── App.css
│   │   ├── index.js        # React entry point
│   │   └── index.css
│   ├── package.json
│   └── .env                # Frontend environment variables (optional)
│
├── postman_collection.json # Postman API collection
└── README.md              # This file
```

## 🔌 API Endpoints

### 1. Create Content
**POST** `/api/createContent`

Upload text, images, and/or files.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `text` (string, optional)
  - `images` (file[], optional, max 20, 10MB each)
  - `files` (file[], optional, max 20, 10MB each)

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

Retrieve content by random key.

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

Download a file from GridFS.

### 4. Delete Content
**DELETE** `/api/delete/:randomKey`

Delete content by random key (only valid within 2 hours).

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### 5. Health Check
**GET** `/health`

Server health status.

## 🗄️ Database Schema

### Text Collection
Stores text content with expiration time.

### ImageMeta Collection
Stores metadata for uploaded images (references GridFS files).

### FileMeta Collection
Stores metadata for uploaded files (references GridFS files).

### RandomKeys Collection
Maps random keys to content items (text, images, files).

All collections use MongoDB TTL indexes for automatic expiration after 2 hours.

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes (general), 50 per hour (content creation)
- **File Validation** - Size limits (10MB), type validation
- **Executable Blocking** - Blocks executable files for security

## 📝 Usage Guide

### Uploading Content

1. Navigate to the home page (`/`)
2. Enter text in the textarea (optional)
3. Select images using the image file input (optional)
4. Select files using the file file input (optional)
5. Click "Upload Content"
6. Copy the generated random key or click "Open Content"

### Viewing Content

1. Navigate to `/view/:key` where `:key` is your random key
2. View text, images, and download files
3. Use "Copy URL" to share the content link
4. Use "Delete" to remove content (only within 2 hours)

## 🧪 Testing with Postman

Import the `postman_collection.json` file into Postman to test all API endpoints.

## 🚢 Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/build` directory.

### Deploy Backend

1. Set `NODE_ENV=production` in `.env`
2. Update MongoDB URI for production
3. Configure CORS for production frontend URL
4. Use process manager like PM2:

```bash
npm install -g pm2
pm2 start backend/server.js --name wepaste-api
```

## 📦 Deployment Considerations

- **Backend**: Deploy to Heroku, AWS, DigitalOcean, etc.
- **Frontend**: Deploy to Vercel, Netlify, AWS S3 + CloudFront, etc.
- **Database**: MongoDB Atlas (already cloud-based)
- **Environment Variables**: Set production values in hosting platform

## 🐛 Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Check your MongoDB Atlas connection string in `.env`
- **GridFS Error**: Ensure MongoDB connection is established before accessing GridFS
- **Port Already in Use**: Change `PORT` in `.env` file

### Frontend Issues

- **API Connection Error**: Check `REACT_APP_API_URL` in frontend `.env`
- **CORS Error**: Ensure backend CORS is configured for frontend URL
- **Build Errors**: Clear `node_modules` and reinstall dependencies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using the MERN stack

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database hosting
- nanoid for random key generation
- React team for the amazing framework

---

**Note**: All content expires after 2 hours. Make sure to download or save important content before expiration.

