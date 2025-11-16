import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';

const UploadPage = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = (data) => {
    setUploadResult(data);
    setCopied(false);
  };

  /**
   * Copy key to clipboard
   */
  const copyToClipboard = () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Copy link to clipboard
   */
  const copyLink = () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    const url = `${window.location.origin}/view/${key}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Open content page
   */
  const openContent = () => {
    const key = uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey;
    navigate(`/view/${key}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">WePaste</h1>
          <p className="text-gray-600 dark:text-gray-400">Pastebin + FileShare Service</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Content expires after 2 hours</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/retrieve')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm"
            >
              Retrieve Content by Key →
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {!uploadResult ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          /* Success Message */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <svg
                  className="w-16 h-16 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Content Uploaded Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your content will expire in <span className="font-semibold">{uploadResult.expireIn}</span>
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 mb-4 border-2 border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold uppercase tracking-wide">Your 4-Digit Access Key:</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                    {uploadResult.randomKey?.padStart(4, '0') || uploadResult.randomKey}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  Share this key to access your content on any device
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={copyToClipboard}
                  className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {copied ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    )}
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                </button>

                <button
                  onClick={openContent}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>View Content</span>
                </button>

                <button
                  onClick={() => {
                    setUploadResult(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Upload More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>WePaste - Secure file sharing made simple</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

