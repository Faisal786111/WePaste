/**
 * Universal clipboard copy function with fallback for insecure contexts
 * Supports both modern Clipboard API and legacy execCommand fallback
 * 
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  // Modern Clipboard API (HTTPS or localhost)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      // If clipboard API fails, fall back to legacy method
      console.warn('Clipboard API failed, using fallback:', error);
    }
  }

  // Fallback method for insecure HTTP or mobile browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  
  document.body.appendChild(textarea);
  
  // Select and copy
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    // iOS requires a slightly different approach
    const range = document.createRange();
    range.selectNodeContents(textarea);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textarea.setSelectionRange(0, 999999);
  } else {
    textarea.select();
    textarea.setSelectionRange(0, 999999);
  }
  
  try {
    document.execCommand('copy');
  } catch (error) {
    console.error('Failed to copy text:', error);
    throw new Error('Failed to copy to clipboard');
  } finally {
    document.body.removeChild(textarea);
  }
}

