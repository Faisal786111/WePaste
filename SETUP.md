# WePaste - Quick Setup Guide

This guide will help you set up and run WePaste quickly.

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# On Windows:
copy env.example.txt .env
# On Linux/Mac:
cp env.example.txt .env

# Edit .env file and add your MongoDB connection string
# Replace username, password, and cluster URL in MONGODB_URI
```

**Example .env file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/wepaste?retryWrites=true&w=majority
GRIDFS_BUCKET_NAME=uploads
FRONTEND_URL=http://localhost:3000
```

## Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Optional: Create .env file if you want to customize API URL
# On Windows:
copy env.example.txt .env
# On Linux/Mac:
cp env.example.txt .env
```

**Frontend .env (optional):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 4: Run the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: ...
GridFS Bucket initialized
Server running in development mode on port 5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The frontend will automatically open at `http://localhost:3000`

## Step 5: Test the Application

1. Go to `http://localhost:3000`
2. Upload some text, images, or files
3. Copy the random key
4. Navigate to `/view/:key` to view your content

## Troubleshooting

### MongoDB Connection Issues
- Make sure your IP address is whitelisted in MongoDB Atlas (Network Access)
- Verify your username and password are correct
- Check that the database name is `wepaste` or adjust in connection string

### CORS Issues
- Make sure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update `REACT_APP_API_URL` in frontend `.env` accordingly

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Import `postman_collection.json` into Postman to test API endpoints
- Customize the UI in `frontend/src/pages/` and `frontend/src/components/`

Enjoy using WePaste! 🚀

