/**
 * Authentication service
 * Handles password verification using bcrypt
 */

import CONFIG from '../config.js';
import bcrypt from '../lib/bcrypt.js';

/**
 * Verify username and password
 * @param {string} username - Username to verify
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} - Promise resolving to true if credentials are valid
 */
export async function verifyCredentials(username, password) {
    // First check if username matches
    if (username !== CONFIG.AUTH.USERNAME) {
        return false;
    }
    
    try {
        // Use bcrypt to compare password with stored hash
        return await bcrypt.compare(password, CONFIG.AUTH.PASSWORD);
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

/**
 * Get username for authenticated user
 * @returns {string} - Username from config
 */
export function getUsername() {
    return CONFIG.AUTH.USERNAME;
}
