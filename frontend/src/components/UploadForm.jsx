import React, { useState, useRef } from 'react';
import { createContent } from '../utils/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate file size
   */
  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10MB size limit`;
    }
    return null;
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const imageFiles = [];
      const otherFiles = [];

      droppedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else {
          otherFiles.push(file);
        }
      });

      if (imageFiles.length > 0) {
        handleImageFiles(imageFiles);
      }
      if (otherFiles.length > 0) {
        handleFileFiles(otherFiles);
      }
    }
  };

  /**
   * Handle image files
   */
  const handleImageFiles = (selectedImages) => {
    const validationErrors = [];

    selectedImages.forEach((image) => {
      const sizeError = validateFileSize(image);
      if (sizeError) {
        validationErrors.push(sizeError);
      } else if (!image.type.startsWith('image/')) {
        validationErrors.push(`"${image.name}" is not a valid image file`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    } else {
      setImages((prev) => [...prev, ...selectedImages].slice(0, 20));
      setErrors([]);
    }
  };

  /**
   * Handle file selection
   */
  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    handleImageFiles(selectedImages);
  };

  /**
   * Handle file files
   */
  const handleFileFiles = (selectedFiles) => {
    const validationErrors = [];

    selectedFiles.forEach((file) => {
      const sizeError = validateFileSize(file);
      if (sizeError) {
        validationErrors.push(sizeError);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    } else {
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 20));
      setErrors([]);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFileFiles(selectedFiles);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validate at least one content type is provided
    if (!text.trim() && images.length === 0 && files.length === 0) {
      setErrors(['Please provide at least text, images, or files']);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let progressInterval = null;

    try {
      const formData = new FormData();

      // Add text if provided
      if (text.trim()) {
        formData.append('text', text);
      }

      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Add files
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await createContent(formData);
      
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      setText('');
      setImages([]);
      setFiles([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      setErrors([error.error || 'Failed to upload content. Please try again.']);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove image from selection
   */
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /**
   * Remove file from selection
   */
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get file icon
   */
  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
        }`}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-blue-500 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose Images
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose Files
            </button>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={isUploading}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label htmlFor="text" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Text Content <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all shadow-sm hover:shadow-md"
          placeholder="Enter your text content here... (e.g., code, notes, messages)"
          disabled={isUploading}
        />
      </div>

      {/* Selected Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Selected Images ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                {image.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-md mb-2 flex items-center justify-center">
                    <span className="text-2xl">📎</span>
                  </div>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">{image.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{formatFileSize(image.size)}</p>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Selected Files ({files.length})
          </label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="ml-3 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-sm font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Validation Errors</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Uploading...</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isUploading || (!text.trim() && images.length === 0 && files.length === 0)}
        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isUploading ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Uploading...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Content</span>
          </span>
        )}
      </button>
    </div>
  );
};

export default UploadForm;
