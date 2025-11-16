import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContent } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import PreviewImage from '../components/PreviewImage';
import FileDownload from '../components/FileDownload';

const RetrieveContent = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Refs for auto-focus and auto-scroll
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  /**
   * Auto-focus on input when component mounts
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /**
   * Auto-scroll to results when content loads
   */
  useEffect(() => {
    if (content && resultRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        resultRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [content]);

  /**
   * Handle key input - only allow numbers
   */
  const handleKeyChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only numbers, max 4 digits
    setKey(value);
    setError(null);
    setContent(null);
  };

  /**
   * Retrieve content by 4-digit key
   */
  const handleRetrieve = async () => {
    if (!key || key.length === 0) {
      setError('Please enter a 4-digit key');
      return;
    }

    // Pad with leading zeros to ensure 4 digits
    const normalizedKey = key.padStart(4, '0');

    try {
      setLoading(true);
      setError(null);
      setContent(null);

      const response = await getContent(normalizedKey);

      if (response.success) {
        // Handle both new format (with content wrapper) and legacy format
        if (response.data.content) {
          setContent(response.data.content);
        } else {
          setContent(response.data);
        }
      } else {
        setError(response.error || 'Failed to retrieve content');
      }
    } catch (err) {
      setError(err.error || 'Content not found. Please check the key and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleRetrieve();
    }
  };

  /**
   * Copy key to clipboard
   */
  const handleCopyKey = async () => {
    const keyToCopy = key.padStart(4, '0');
    try {
      await copyToClipboard(keyToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy key:', error);
      setError('Failed to copy key to clipboard');
    }
  };

  const hasContent = content && (content.text || (content.images && content.images.length > 0) || (content.files && content.files.length > 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Retrieve Content
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Enter your 4-digit key to access your content
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold text-sm transition-colors flex items-center space-x-1 mx-auto transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Upload new content</span>
            </button>
          </div>
        </div>

        {/* Key Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-6 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="space-y-6">
            <label htmlFor="key-input" className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2 text-center">
              4-Digit Access Key
            </label>
            
            {/* OTP-Style Input */}
            <div className="flex justify-center space-x-4 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 flex items-center justify-center text-3xl md:text-4xl font-extrabold transition-all duration-300 transform ${
                    key.length === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-4 ring-blue-200 dark:ring-blue-800 scale-110 shadow-lg'
                      : key.length > index
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  {key[index] || ''}
                </div>
              ))}
            </div>

            {/* Manual Input with auto-focus */}
            <input
              ref={inputRef}
              id="key-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={key}
              onChange={handleKeyChange}
              onKeyPress={handleKeyPress}
              placeholder="0000"
              maxLength={4}
              className={`w-full px-6 py-4 text-center text-2xl md:text-3xl font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:border-blue-500 transition-all duration-300 tracking-widest shadow-sm hover:shadow-md ${
                key.length > 0 ? 'border-blue-400 dark:border-blue-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading}
            />

            {/* Copy Key Button (when key is entered) */}
            {key && key.length > 0 && (
              <button
                onClick={handleCopyKey}
                className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${
                  copied
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Key Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            )}

            {/* Retrieve Button */}
            <button
              onClick={handleRetrieve}
              disabled={loading || !key}
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-8 py-5 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Retrieving...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Retrieve Content</span>
                </>
              )}
            </button>

            {/* Error Message with animation */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg animate-fadeIn">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Success Message with soft animation */}
            {!loading && content && hasContent && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg animate-fadeIn">
                <svg className="w-6 h-6 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Content retrieved successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Display - with ref for auto-scroll */}
        <div ref={resultRef}>
          {content && hasContent && (
            <div className="space-y-6 animate-fadeIn">
              {/* Text Content */}
              {content.text && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span>Text Content</span>
                  </h2>
                  <div className="bg-gray-900 dark:bg-black rounded-xl p-6 border border-gray-700 shadow-inner">
                    <pre className="whitespace-pre-wrap text-green-400 font-mono text-sm md:text-base overflow-x-auto">
                      {content.text}
                    </pre>
                  </div>
                </div>
              )}

              {/* Images - Large Preview */}
              {content.images && content.images.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>Images ({content.images.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {content.images.map((image, index) => (
                      <div key={index} className="group transform hover:scale-[1.02] transition-transform duration-300">
                        <PreviewImage image={image} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files - Download Buttons */}
              {content.files && content.files.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>Files ({content.files.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {content.files.map((file, index) => (
                      <div key={index} className="transform hover:scale-[1.01] transition-transform duration-300">
                        <FileDownload file={file} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* No Content Message */}
        {content && !hasContent && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No content found for this key</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetrieveContent;
