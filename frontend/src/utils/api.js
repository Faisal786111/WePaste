import axios from 'axios';

/**
 * API Configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout for large file uploads
});

/**
 * POST /api/createContent
 * Upload content (text, images, files)
 */
export const createContent = async (formData) => {
  try {
    const response = await api.post('/createContent', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create content' };
  }
};

/**
 * GET /api/readContent/:randomKey
 * Fetch content by random key (legacy endpoint)
 */
export const readContent = async (randomKey) => {
  try {
    const response = await api.get(`/readContent/${randomKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch content' };
  }
};

/**
 * GET /api/getContent/:randomKey
 * Get content by key - Returns formatted response
 */
export const getContent = async (randomKey) => {
  try {
    const response = await api.get(`/getContent/${randomKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch content' };
  }
};

/**
 * DELETE /api/delete/:randomKey
 * Delete content by random key
 */
export const deleteContent = async (randomKey) => {
  try {
    const response = await api.delete(`/delete/${randomKey}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete content' };
  }
};

/**
 * GET /api/download/:fileId
 * Get download URL for a file
 */
export const getDownloadUrl = (fileId) => {
  // If fileId is already a full URL, return it
  if (fileId && fileId.startsWith('http')) {
    return fileId;
  }
  // Otherwise construct the URL
  return `${API_BASE_URL}/download/${fileId}`;
};

export default api;

