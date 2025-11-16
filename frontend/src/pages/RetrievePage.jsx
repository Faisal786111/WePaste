import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContent } from '../utils/api';
import PreviewImage from '../components/PreviewImage';
import FileDownload from '../components/FileDownload';

const RetrievePage = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (e.key === 'Enter') {
      handleRetrieve();
    }
  };

  const hasContent = content && (content.text || (content.images && content.images.length > 0) || (content.files && content.files.length > 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">Retrieve Content</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your 4-digit key to access your content</p>
        </div>

        {/* Key Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <label htmlFor="key-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              4-Digit Access Key
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="key-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={key}
                onChange={handleKeyChange}
                onKeyPress={handleKeyPress}
                placeholder="0000"
                maxLength={4}
                className="flex-1 px-6 py-4 text-center text-3xl font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all tracking-widest"
                disabled={loading}
              />
              <button
                onClick={handleRetrieve}
                disabled={loading || !key}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Retrieve</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {!loading && content && hasContent && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Content retrieved successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Display */}
        {content && hasContent && (
          <div className="space-y-6">
            {/* Text Content */}
            {content.text && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Text Content</span>
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans">{content.text}</pre>
                </div>
              </div>
            )}

            {/* Images */}
            {content.images && content.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Images ({content.images.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.images.map((image, index) => (
                    <PreviewImage key={index} image={image} />
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {content.files && content.files.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Files ({content.files.length})</span>
                </h2>
                <div className="space-y-3">
                  {content.files.map((file, index) => (
                    <FileDownload key={index} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Content Message */}
        {content && !hasContent && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">No content found for this key</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center justify-center space-x-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Upload New Content</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetrievePage;

