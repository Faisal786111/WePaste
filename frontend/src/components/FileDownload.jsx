import React from 'react';
import { getDownloadUrl } from '../utils/api';

const FileDownload = ({ file }) => {
  // Handle both full URL and file ID
  const downloadUrl = file.url || file.fileUrl || getDownloadUrl(file.id);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Get file icon and color based on file type
   */
  const getFileInfo = (mimeType) => {
    const type = mimeType?.toLowerCase() || '';
    
    if (type.includes('pdf')) return { icon: '📄', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' };
    if (type.includes('word') || type.includes('document') || type.includes('docx')) 
      return { icon: '📝', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' };
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) 
      return { icon: '📊', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' };
    if (type.includes('zip') || type.includes('archive') || type.includes('rar')) 
      return { icon: '📦', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' };
    if (type.includes('video')) return { icon: '🎥', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' };
    if (type.includes('audio')) return { icon: '🎵', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' };
    if (type.includes('text') || type.includes('plain')) 
      return { icon: '📃', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
    return { icon: '📎', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fileInfo = getFileInfo(file.type);
  const fileSize = file.size ? formatFileSize(file.size) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 flex items-center justify-between hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01]">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${fileInfo.color} flex-shrink-0 shadow-lg`}>
          {fileInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-800 dark:text-gray-200 truncate mb-1">
            {file.name || 'File'}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
              {file.type || 'application/octet-stream'}
            </p>
            {fileSize && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{fileSize}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download</span>
      </button>
    </div>
  );
};

export default FileDownload;

