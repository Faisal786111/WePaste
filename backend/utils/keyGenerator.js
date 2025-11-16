const { nanoid } = require('nanoid');
const RandomKeys = require('../models/RandomKeys');

/**
 * Generate a random 4-digit key (0000-9999)
 * @returns {String} 4-digit key with leading zeros
 */
const generate4DigitKey = () => {
  // Generate random number between 0 and 9999
  const randomNum = Math.floor(Math.random() * 10000);
  // Pad with leading zeros to ensure 4 digits
  return randomNum.toString().padStart(4, '0');
};

/**
 * Generate a guaranteed unique 4-digit key by checking database
 * @param {Number} maxRetries - Maximum number of retry attempts (default: 100)
 * @returns {Promise<String>} A unique 4-digit key (0000-9999)
 * @throws {Error} If unable to generate unique key after max retries
 */
const generateUnique4DigitKey = async (maxRetries = 100) => {
  let attempts = 0;
  
  // Try to find an unused key
  while (attempts < maxRetries) {
    // Generate a 4-digit key
    const key = generate4DigitKey();
    
    try {
      // Check if key already exists in database
      const existingKey = await RandomKeys.findOne({ key: key });
      
      // If key doesn't exist, it's unique - return it
      if (!existingKey) {
        return key;
      }
      
      // Key exists, increment attempts and try again
      attempts++;
      
      // Log warning if we're getting close to max retries
      if (attempts >= maxRetries - 5) {
        console.warn(`Warning: Key collision detected. Retry attempt ${attempts}/${maxRetries} for 4-digit key generation.`);
      }
    } catch (error) {
      // Database error - log and throw
      console.error('Error checking key uniqueness in database:', error.message);
      throw new Error('Failed to verify key uniqueness. Database error occurred.');
    }
  }
  
  // If we've exhausted all retries, throw an error
  throw new Error(`Unable to generate unique 4-digit key after ${maxRetries} attempts. Database may be full or experiencing issues.`);
};

/**
 * Generate a random key using nanoid (legacy - kept for backward compatibility)
 * @param {Number} length - Length of the key (default: 10)
 * @returns {String} Random key
 */
const generateRandomKey = (length = 10) => {
  return nanoid(length);
};

/**
 * Generate a guaranteed unique key by checking database (legacy)
 * @param {Number} length - Length of the key (default: 10)
 * @param {Number} maxRetries - Maximum number of retry attempts (default: 10)
 * @returns {Promise<String>} A unique random key
 * @throws {Error} If unable to generate unique key after max retries
 */
const generateUniqueKey = async (length = 10, maxRetries = 10) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const key = nanoid(length);
    
    try {
      const existingKey = await RandomKeys.findOne({ key: key });
      
      if (!existingKey) {
        return key;
      }
      
      attempts++;
      
      if (attempts >= maxRetries - 2) {
        console.warn(`Warning: Key collision detected. Retry attempt ${attempts}/${maxRetries} for key generation.`);
      }
    } catch (error) {
      console.error('Error checking key uniqueness in database:', error.message);
      throw new Error('Failed to verify key uniqueness. Database error occurred.');
    }
  }
  
  throw new Error(`Unable to generate unique key after ${maxRetries} attempts.`);
};

module.exports = { 
  generate4DigitKey, 
  generateUnique4DigitKey,
  generateRandomKey, 
  generateUniqueKey 
};

