/**
 * Storage service for handling local storage operations
 */

// Constants
const PASSWORD_STORAGE_KEY = 'user_password';

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Set user as logged in
 */
export function setLoggedIn() {
    localStorage.setItem('isLoggedIn', 'true');
}

/**
 * Clear login status (logout)
 */
export function clearLoginStatus() {
    localStorage.removeItem('isLoggedIn');
    clearStoredPassword();
}

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
    console.log('Password cleared from localStorage');
}
