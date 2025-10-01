/**
 * Security Service
 * Handles HMAC signature generation, password storage, and security headers for API calls
 */

// We'll use CryptoJS as a global variable (no import needed)
// Make sure crypto-js.min.js is included via script tag before this file

// Constants
const PASSWORD_STORAGE_KEY = 'user_password';

/**
 * Store user password in localStorage (only during active session)
 * @param {string} password - The user's plain password
 */
export function storePassword(password) {
    if (!password) {
        console.error('Cannot store empty password');
        return;
    }
    localStorage.setItem(PASSWORD_STORAGE_KEY, password);
    console.log('Password stored securely in localStorage');
}

/**
 * Retrieve user password from localStorage
 * @returns {string|null} - The stored password or null if not found
 */
export function getStoredPassword() {
    const password = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!password) {
        console.warn('No password found in localStorage. Security headers cannot be generated.');
    }
    return password;
}

/**
 * Remove stored password from localStorage
 */
export function clearStoredPassword() {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
}

/**
 * Generate current timestamp in format yyyymmddhhrrss using UTC time
 * @returns {string} - Formatted timestamp in UTC
 */
export function generateTimestamp() {
    const now = new Date();
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    console.log('Generated UTC timestamp:', `${year}${month}${day}${hours}${minutes}${seconds}`);
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} - Domain part of the URL
 */
export function extractDomain(url) {
    try {
        // Extract domain from URL (without protocol and path)
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        console.error('Invalid URL:', url);
        return url; // Return original URL if parsing fails
    }
}

/**
 * Generate message string for HMAC generation
 * @param {string} url - API endpoint URL
 * @param {string} timestamp - Formatted timestamp
 * @returns {string} - Message string in format domain:timestamp
 */
export function generateMessage(url, timestamp) {
    const domain = extractDomain(url);
    return `${domain}:${timestamp}`;
}

/**
 * Generate HMAC SHA-512 signature
 * @param {string} message - Message to sign
 * @param {string} secret - Secret key (user's password)
 * @returns {string} - Hex-encoded HMAC signature
 */
export function generateSignature(message, secret) {
    if (!secret) {
        console.error('Cannot generate signature: No secret provided');
        return '';
    }
    
    // Check if CryptoJS is available
    console.log('CryptoJS available:', typeof CryptoJS !== 'undefined');
    console.log('CryptoJS HmacSHA512 available:', typeof CryptoJS !== 'undefined' && typeof CryptoJS.HmacSHA512 === 'function');
    
    try {
        // Log input parameters
        console.log('Generating signature with message:', message);
        console.log('Secret key (first character):', secret ? secret.charAt(0) + '...' : 'none');
        
        // Generate signature
        const signature = CryptoJS.HmacSHA512(message, secret).toString(CryptoJS.enc.Hex);
        console.log('Signature generated successfully:', signature.substring(0, 10) + '...');
        return signature;
    } catch (e) {
        console.error('Error generating HMAC signature:', e);
        return '';
    }
}

/**
 * Generate security headers for API requests
 * @param {string} url - API endpoint URL
 * @returns {Object|null} - Object with x-message and x-signature headers, or null if error
 */
export function generateSecurityHeaders(url) {
    const password = getStoredPassword();
    
    if (!password) {
        console.error('Cannot generate security headers: User not authenticated');
        return null;
    }
    
    const timestamp = generateTimestamp();
    const message = generateMessage(url, timestamp);
    const signature = generateSignature(message, password);
    
    console.log('Generated security headers:', {
        'url': url,
        'timestamp': timestamp,
        'message': message,
        'signature-preview': signature.substring(0, 10) + '...'
    });
    
    return {
        'x-message': message,
        'x-signature': signature
    };
}

/**
 * Add security headers to fetch options
 * @param {Object} options - Fetch options object
 * @param {string} url - API endpoint URL
 * @returns {Object} - Updated fetch options with security headers
 */
export function addSecurityHeadersToFetchOptions(options, url) {
    const headers = generateSecurityHeaders(url);
    
    if (!headers) {
        console.warn('No security headers generated. User may not be logged in.');
        return options;
    }
    
    // Create headers object if it doesn't exist
    if (!options.headers) {
        options.headers = {};
    }
    
    // Add security headers
    options.headers['x-message'] = headers['x-message'];
    options.headers['x-signature'] = headers['x-signature'];
    
    // Log that headers were added
    console.log('Security headers added to fetch request:', {
        'x-message': headers['x-message'],
        'x-signature': headers['x-signature'].substring(0, 10) + '...'
    });
    
    return options;
}

/**
 * Add security headers to XMLHttpRequest
 * @param {XMLHttpRequest} xhr - XMLHttpRequest instance
 * @param {string} url - API endpoint URL
 */
export function addSecurityHeadersToXhr(xhr, url) {
    const headers = generateSecurityHeaders(url);
    
    if (!headers) {
        console.warn('No security headers generated for XHR. User may not be logged in.');
        return;
    }
    
    try {
        // Add security headers
        xhr.setRequestHeader('x-message', headers['x-message']);
        xhr.setRequestHeader('x-signature', headers['x-signature']);
        
        // Log that headers were added
        console.log('Security headers added to XHR request:', {
            'x-message': headers['x-message'],
            'x-signature': headers['x-signature'].substring(0, 10) + '...'
        });
    } catch (error) {
        console.error('Error setting XHR headers:', error.message);
    }
}
