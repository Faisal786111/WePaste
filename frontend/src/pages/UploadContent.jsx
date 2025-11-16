import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import { copyToClipboard } from '../utils/clipboard';

const UploadContent = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'key' or 'url'
  const navigate = useNavigate();

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = (data) => {
    setUploadResult(data);
    setCopied(false);
    setCopiedType(null);
  };

  /**
   * Copy key to clipboard with fallback
   */
  const handleCopyKey = async () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    try {
      await copyToClipboard(key);
      setCopied(true);
      setCopiedType('key');
      setTimeout(() => {
        setCopied(false);
        setCopiedType(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy key:', error);
      alert('Failed to copy key to clipboard. Please copy manually: ' + key);
    }
  };

  /**
   * Copy link to clipboard with fallback
   */
  const handleCopyLink = async () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    const url = `${window.location.origin}/view/${key}`;
    try {
      await copyToClipboard(url);
      setCopied(true);
      setCopiedType('url');
      setTimeout(() => {
        setCopied(false);
        setCopiedType(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL to clipboard. Please copy manually: ' + url);
    }
  };

  /**
   * Open content page
   */
  const openContent = () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    navigate(`/view/${key}`);
  };

  /**
   * Navigate to retrieve page
   */
  const goToRetrieve = () => {
    navigate('/retrieve');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            WePaste
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Share text, images & files instantly
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Content expires after 2 hours
          </p>
          <div className="mt-4">
            <button
              onClick={goToRetrieve}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm transition-colors flex items-center space-x-1 mx-auto transform hover:scale-105"
            >
              <span>Retrieve content by key</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Upload Form or Success Message */}
        {!uploadResult ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          /* Success Message - Large Key Display */
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="text-center space-y-8">
              {/* Success Icon */}
              <div className="inline-block p-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-xl animate-pulse">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Upload Successful! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Your content will expire in <span className="font-bold text-blue-600 dark:text-blue-400">{uploadResult.expireIn}</span>
                </p>
              </div>

              {/* 4-Digit Key Display - OTP Style */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 border-4 border-blue-300 dark:border-blue-700 shadow-inner transform hover:scale-[1.02] transition-transform duration-300">
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-widest">
                  Your 4-Digit Access Key
                </p>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  {String(uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey || '0000').split('').map((digit, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300"
                    >
                      <span className="text-4xl font-extrabold text-white">{digit}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  Share this key to access your content on any device
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={handleCopyKey}
                  className={`${
                    copied && copiedType === 'key'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2`}
                >
                  {copied && copiedType === 'key' ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Key</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyLink}
                  className={`${
                    copied && copiedType === 'url'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                  } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2`}
                >
                  {copied && copiedType === 'url' ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={openContent}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Content</span>
                </button>

                <button
                  onClick={() => {
                    setUploadResult(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                >
                  Upload More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm animate-fadeIn">
          <p>Secure file sharing made simple • WePaste</p>
        </div>
      </div>
    </div>
  );
};

export default UploadContent;
